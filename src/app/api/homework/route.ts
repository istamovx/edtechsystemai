import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export async function GET() {
  const user = await requireTenant();
  const homeworks = await prisma.homework.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      group: { select: { id: true, name: true, _count: { select: { members: true } } } },
      _count: { select: { submissions: true } },
    },
  });
  return NextResponse.json({ data: homeworks });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  const { title, description, groupId, dueAt } = await req.json();
  if (!title || !groupId) return NextResponse.json({ error: "title va groupId kerak" }, { status: 400 });

  const group = await prisma.group.findFirst({ where: { id: groupId, tenantId: user.tenantId } });
  if (!group) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  const hw = await prisma.homework.create({
    data: {
      tenantId: user.tenantId,
      groupId,
      title,
      description: description || undefined,
      dueAt: dueAt ? new Date(dueAt) : undefined,
    },
  });
  return NextResponse.json({ data: hw }, { status: 201 });
}
