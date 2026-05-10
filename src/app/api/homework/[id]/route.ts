import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const existing = await prisma.homework.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const { title, description, dueAt } = await req.json();
  const data: any = {};
  if (title) data.title = title;
  if (description !== undefined) data.description = description || null;
  if (dueAt !== undefined) data.dueAt = dueAt ? new Date(dueAt) : null;

  const updated = await prisma.homework.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const existing = await prisma.homework.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  await prisma.homework.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
