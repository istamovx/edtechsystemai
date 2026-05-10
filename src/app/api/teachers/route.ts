import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { teacherCreateSchema } from "@/lib/validations/teacher";

export async function GET(req: Request) {
  const user = await requireTenant();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const onlyMentors = searchParams.get("onlyMentors") === "1";

  const where: any = { tenantId: user.tenantId };
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }
  if (status) where.status = status;
  if (onlyMentors) where.isMentor = true;

  const teachers = await prisma.teacher.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { groups: true, lessons: true } },
    },
  });

  return NextResponse.json({ data: teachers, total: teachers.length });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = teacherCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const teacher = await prisma.teacher.create({
      data: {
        tenantId: user.tenantId,
        fullName: d.fullName,
        phone: d.phone || undefined,
        birthDate: d.birthDate ? new Date(d.birthDate) : undefined,
        subjects: d.subjects ?? [],
        bio: d.bio || undefined,
        isMentor: d.isMentor,
        salaryType: d.salaryType,
        salaryRate: d.salaryRate ? Number(d.salaryRate) : undefined,
        bonusPercent: d.bonusPercent ? Number(d.bonusPercent) : undefined,
        cardId: d.cardId || undefined,
        status: d.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId, userId: user.id,
        action: "CREATE_TEACHER", entity: "Teacher", entityId: teacher.id,
        changes: { created: teacher } as any,
      },
    });

    return NextResponse.json({ data: teacher }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Bu karta ID allaqachon mavjud" }, { status: 409 });
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}
