import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const room = await prisma.room.findFirst({
    where: { id: params.id, branch: { tenantId: user.tenantId } },
  });
  if (!room) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const { name, capacity, branchId } = await req.json();
  const data: any = {};
  if (name) data.name = name;
  if (capacity !== undefined) data.capacity = capacity ? Number(capacity) : null;
  if (branchId) {
    const b = await prisma.branch.findFirst({ where: { id: branchId, tenantId: user.tenantId } });
    if (!b) return NextResponse.json({ error: "Filial topilmadi" }, { status: 404 });
    data.branchId = branchId;
  }
  const updated = await prisma.room.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const room = await prisma.room.findFirst({
    where: { id: params.id, branch: { tenantId: user.tenantId } },
    include: { _count: { select: { lessons: true } } },
  });
  if (!room) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (room._count.lessons > 0) {
    return NextResponse.json({ error: "Xonada darslar bor" }, { status: 409 });
  }
  await prisma.room.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
