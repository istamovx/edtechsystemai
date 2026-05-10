import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";

export async function GET() {
  const user = await requireTenant();
  const rooms = await prisma.room.findMany({
    where: { branch: { tenantId: user.tenantId } },
    orderBy: { name: "asc" },
    include: {
      branch: { select: { id: true, name: true } },
      _count: { select: { lessons: true } },
    },
  });
  return NextResponse.json({ data: rooms });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const { name, capacity, branchId } = await req.json();
  if (!name || !branchId) return NextResponse.json({ error: "name va branchId kerak" }, { status: 400 });

  const branch = await prisma.branch.findFirst({ where: { id: branchId, tenantId: user.tenantId } });
  if (!branch) return NextResponse.json({ error: "Filial topilmadi" }, { status: 404 });

  const room = await prisma.room.create({
    data: { name, capacity: capacity ? Number(capacity) : null, branchId },
  });
  return NextResponse.json({ data: room }, { status: 201 });
}
