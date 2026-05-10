import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  const existing = await prisma.branch.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const { name, address, phone } = await req.json();
  const data: any = {};
  if (name) data.name = name;
  if (address !== undefined) data.address = address || null;
  if (phone !== undefined) data.phone = phone || null;

  const updated = await prisma.branch.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  const existing = await prisma.branch.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: { _count: { select: { students: true, groups: true, rooms: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (existing._count.students > 0 || existing._count.groups > 0 || existing._count.rooms > 0) {
    return NextResponse.json({ error: "Filialga bog'liq ma'lumotlar bor (o'quvchilar, guruhlar yoki xonalar)" }, { status: 409 });
  }
  await prisma.branch.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
