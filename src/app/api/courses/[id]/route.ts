import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { courseCreateSchema } from "@/lib/validations/group";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.course.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = courseCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const data: any = {};
  if (d.name) data.name = d.name;
  if (d.description !== undefined) data.description = d.description || null;
  if (d.duration !== undefined) data.duration = d.duration;
  if (d.price !== undefined) data.price = Number(d.price);

  const updated = await prisma.course.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.course.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: { _count: { select: { groups: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (existing._count.groups > 0) {
    return NextResponse.json({ error: `Bu kursga ${existing._count.groups} ta guruh bog'langan` }, { status: 409 });
  }
  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
