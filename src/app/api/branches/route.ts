import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";

export async function GET() {
  const user = await requireTenant();
  const branches = await prisma.branch.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { students: true, groups: true, rooms: true } } },
  });
  return NextResponse.json({ data: branches });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  const { name, address, phone } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom kerak" }, { status: 400 });

  const branch = await prisma.branch.create({
    data: { tenantId: user.tenantId, name, address: address || undefined, phone: phone || undefined },
  });
  return NextResponse.json({ data: branch }, { status: 201 });
}
