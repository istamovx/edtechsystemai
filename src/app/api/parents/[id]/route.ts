import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { parentUpdateSchema } from "@/lib/validations/parent";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.parent.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = parentUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const data: any = {};
  if (d.fullName) data.fullName = d.fullName;
  if (d.phone) data.phone = d.phone;
  if (d.telegramId !== undefined) data.telegramId = d.telegramId || null;

  const updated = await prisma.parent.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "UPDATE_PARENT", entity: "Parent", entityId: updated.id,
      changes: { before: existing, after: updated } as any,
    },
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.parent.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: { children: true },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  if (existing.children.length > 0) {
    return NextResponse.json({
      error: `Bu ota-onaga ${existing.children.length} ta o'quvchi bog'langan. Avval bog'lashlarni olib tashlang.`,
    }, { status: 409 });
  }

  await prisma.parent.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "DELETE_PARENT", entity: "Parent", entityId: params.id,
      changes: { deleted: existing } as any,
    },
  });
  return NextResponse.json({ ok: true });
}
