import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

const BOT_URL = process.env.TELEGRAM_BOT_INTERNAL_URL || "http://localhost:4000";

export async function GET(req: Request) {
  const user = await requireTenant();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const lessonId = searchParams.get("lessonId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  const where: any = { tenantId: user.tenantId };
  if (studentId) where.studentId = studentId;
  if (lessonId) where.lessonId = lessonId;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }

  const items = await prisma.attendance.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      student: { select: { id: true, fullName: true } },
      lesson: { select: { id: true, topic: true } },
    },
  });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  const { studentId, lessonId, status, note } = await req.json();
  if (!studentId || !status) {
    return NextResponse.json({ error: "studentId va status kerak" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: { id: studentId, tenantId: user.tenantId },
    include: { parent: true },
  });
  if (!student) return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });

  const att = await prisma.attendance.create({
    data: {
      tenantId: user.tenantId,
      studentId,
      lessonId: lessonId || undefined,
      status,
      source: "MANUAL",
      enterAt: status === "PRESENT" || status === "LATE" ? new Date() : undefined,
      note: note || undefined,
    },
  });

  // Ota-onaga avtomatik xabar (ABSENT yoki LATE bo'lsa)
  if ((status === "ABSENT" || status === "LATE") && student.parent?.telegramId) {
    const time = new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    let text: string;
    if (status === "ABSENT") {
      text = `⚠️ <b>Davomat bildirishnomasi</b>\n\n👨‍🎓 ${student.fullName}\n❌ Bugun darsga <b>kelmadi</b>\n🕐 ${time}\n\nIltimos, sababini xabar qiling.`;
    } else {
      text = `⏰ <b>Davomat bildirishnomasi</b>\n\n👨‍🎓 ${student.fullName}\n⚠️ Bugun darsga <b>kech keldi</b>\n🕐 ${time}`;
    }
    fetch(`${BOT_URL}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: student.parent.telegramId, text }),
    }).catch(() => {});
  }

  return NextResponse.json({ data: att }, { status: 201 });
}
