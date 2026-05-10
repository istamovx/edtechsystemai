import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { groupCreateSchema } from "@/lib/validations/group";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const group = await prisma.group.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      course: true,
      teacher: { select: { id: true, fullName: true } },
      branch: true,
      members: { include: { student: { select: { id: true, fullName: true, phone: true } } } },
      lessons: { orderBy: { startsAt: "desc" }, take: 20 },
    },
  });
  if (!group) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ data: group });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.group.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = groupCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya" }, { status: 400 });

  const d = parsed.data;
  const data: any = {};
  if (d.name) data.name = d.name;
  if (d.courseId !== undefined) data.courseId = d.courseId || null;
  if (d.teacherId !== undefined) data.teacherId = d.teacherId || null;
  if (d.branchId !== undefined) data.branchId = d.branchId || null;
  if (d.startDate !== undefined) data.startDate = d.startDate ? new Date(d.startDate) : null;
  if (d.endDate !== undefined) data.endDate = d.endDate ? new Date(d.endDate) : null;
  if (d.status) data.status = d.status;
  if (d.scheduleDays !== undefined || d.scheduleStartTime !== undefined || d.scheduleEndTime !== undefined) {
    data.schedule = {
      days: d.scheduleDays ?? (existing.schedule as any)?.days ?? [],
      startTime: d.scheduleStartTime ?? (existing.schedule as any)?.startTime,
      endTime: d.scheduleEndTime ?? (existing.schedule as any)?.endTime,
    };
  }

  const updated = await prisma.group.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.group.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: { _count: { select: { members: true, lessons: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (existing._count.lessons > 0) {
    return NextResponse.json({ error: "Guruhda darslar bor — avval ularni o'chiring" }, { status: 409 });
  }
  await prisma.group.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

// Guruh a'zolari boshqaruvi
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const { studentIds } = (await req.json()) as { studentIds: string[] };
  if (!Array.isArray(studentIds)) return NextResponse.json({ error: "studentIds kerak" }, { status: 400 });

  const group = await prisma.group.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!group) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  // Eski a'zolarni o'chirish va yangilarini qo'shish
  await prisma.groupMember.deleteMany({ where: { groupId: params.id } });
  if (studentIds.length > 0) {
    await prisma.groupMember.createMany({
      data: studentIds.map((sid) => ({ groupId: params.id, studentId: sid })),
      skipDuplicates: true,
    });
  }
  return NextResponse.json({ ok: true, count: studentIds.length });
}
