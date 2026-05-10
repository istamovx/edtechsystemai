import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { teacherUpdateSchema } from "@/lib/validations/teacher";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const teacher = await prisma.teacher.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: { groups: true, lessons: { take: 20, orderBy: { startsAt: "desc" } } },
  });
  if (!teacher) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ data: teacher });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.teacher.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = teacherUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const data: any = {};
  if (d.fullName) data.fullName = d.fullName;
  if (d.phone !== undefined) data.phone = d.phone || null;
  if (d.birthDate !== undefined) data.birthDate = d.birthDate ? new Date(d.birthDate) : null;
  if (d.subjects !== undefined) data.subjects = d.subjects;
  if (d.bio !== undefined) data.bio = d.bio || null;
  if (d.isMentor !== undefined) data.isMentor = d.isMentor;
  if (d.salaryType) data.salaryType = d.salaryType;
  if (d.salaryRate !== undefined) data.salaryRate = d.salaryRate ? Number(d.salaryRate) : null;
  if (d.bonusPercent !== undefined) data.bonusPercent = d.bonusPercent ? Number(d.bonusPercent) : null;
  if (d.cardId !== undefined) data.cardId = d.cardId || null;
  if (d.status) data.status = d.status;

  try {
    const updated = await prisma.teacher.update({ where: { id: params.id }, data });
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId, userId: user.id,
        action: "UPDATE_TEACHER", entity: "Teacher", entityId: updated.id,
        changes: { before: existing, after: updated } as any,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Bu karta ID boshqa o'qituvchida bor" }, { status: 409 });
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.teacher.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await prisma.teacher.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "DELETE_TEACHER", entity: "Teacher", entityId: params.id,
      changes: { deleted: existing } as any,
    },
  });
  return NextResponse.json({ ok: true });
}
