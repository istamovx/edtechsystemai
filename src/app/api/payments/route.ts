import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canViewFinance } from "@/lib/session";
import { paymentCreateSchema } from "@/lib/validations/payment";

export async function GET(req: Request) {
  const user = await requireTenant();
  if (!canViewFinance(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const method = searchParams.get("method") ?? "";
  const month = searchParams.get("month") ?? ""; // YYYY-MM

  const where: any = { tenantId: user.tenantId };
  if (status) where.status = status;
  if (method) where.method = method;
  if (month) where.forMonth = month;
  if (q) {
    where.student = {
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      student: { select: { id: true, fullName: true, phone: true } },
    },
  });

  return NextResponse.json({ data: payments });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canViewFinance(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json();
  const parsed = paymentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  // Tenant ichidagi student tekshiruvi
  const student = await prisma.student.findFirst({
    where: { id: d.studentId, tenantId: user.tenantId },
    include: { parent: true },
  });
  if (!student) return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });

  const payment = await prisma.payment.create({
    data: {
      tenantId: user.tenantId,
      studentId: d.studentId,
      amount: Number(d.amount),
      method: d.method,
      status: d.status,
      forMonth: d.forMonth || undefined,
      note: d.note || undefined,
      paidAt: d.status === "PAID" ? (d.paidAt ? new Date(d.paidAt) : new Date()) : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "CREATE_PAYMENT", entity: "Payment", entityId: payment.id,
      changes: { created: { ...payment, amount: Number(payment.amount) } } as any,
    },
  });

  // Ota-onaga Telegram xabari yuborish (agar PAID va bog'langan bo'lsa)
  if (d.status === "PAID" && student.parent?.telegramId) {
    const botUrl = process.env.TELEGRAM_BOT_INTERNAL_URL || "http://localhost:4000";
    fetch(`${botUrl}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: student.parent.telegramId,
        text:
          `💳 To'lov qabul qilindi\n\n` +
          `👨‍🎓 ${student.fullName}\n` +
          `💰 ${Number(d.amount).toLocaleString("uz-UZ")} so'm\n` +
          `📅 ${d.forMonth ?? new Date().toLocaleDateString("uz-UZ")}\n` +
          `🏷 ${d.method}\n\n` +
          `Rahmat!`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ data: payment }, { status: 201 });
}
