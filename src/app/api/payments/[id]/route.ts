import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canViewFinance } from "@/lib/session";
import { paymentUpdateSchema } from "@/lib/validations/payment";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canViewFinance(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.payment.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = paymentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const data: any = {};
  if (d.amount !== undefined) data.amount = Number(d.amount);
  if (d.method) data.method = d.method;
  if (d.status) data.status = d.status;
  if (d.forMonth !== undefined) data.forMonth = d.forMonth || null;
  if (d.note !== undefined) data.note = d.note || null;
  if (d.paidAt !== undefined) data.paidAt = d.paidAt ? new Date(d.paidAt) : null;

  const updated = await prisma.payment.update({ where: { id: params.id }, data });

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "UPDATE_PAYMENT", entity: "Payment", entityId: updated.id,
      changes: { before: { ...existing, amount: Number(existing.amount) }, after: { ...updated, amount: Number(updated.amount) } } as any,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (user.role !== "TENANT_OWNER") {
    return NextResponse.json({ error: "Faqat markaz egasi to'lovni o'chiradi" }, { status: 403 });
  }

  const existing = await prisma.payment.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await prisma.payment.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "DELETE_PAYMENT", entity: "Payment", entityId: params.id,
      changes: { deleted: { ...existing, amount: Number(existing.amount) } } as any,
    },
  });

  return NextResponse.json({ ok: true });
}
