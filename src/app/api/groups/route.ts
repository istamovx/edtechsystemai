import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { groupCreateSchema } from "@/lib/validations/group";

export async function GET() {
  const user = await requireTenant();
  const groups = await prisma.group.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, name: true, price: true } },
      teacher: { select: { id: true, fullName: true } },
      branch: { select: { id: true, name: true } },
      _count: { select: { members: true, lessons: true } },
    },
  });
  return NextResponse.json({ data: groups });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json();
  const parsed = groupCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const group = await prisma.group.create({
    data: {
      tenantId: user.tenantId,
      name: d.name,
      courseId: d.courseId || undefined,
      teacherId: d.teacherId || undefined,
      branchId: d.branchId || undefined,
      startDate: d.startDate ? new Date(d.startDate) : undefined,
      endDate: d.endDate ? new Date(d.endDate) : undefined,
      status: d.status,
      schedule: {
        days: d.scheduleDays,
        startTime: d.scheduleStartTime,
        endTime: d.scheduleEndTime,
      } as any,
    },
  });
  return NextResponse.json({ data: group }, { status: 201 });
}
