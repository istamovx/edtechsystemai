import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { studentCreateSchema } from "@/lib/validations/student";

export async function GET(req: Request) {
  const user = await requireTenant();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 50;

  const where: any = { tenantId: user.tenantId };
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { cardId: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        parent: { select: { id: true, fullName: true, phone: true } },
        branch: { select: { id: true, name: true } },
        _count: { select: { payments: true, attendances: true, examAttempts: true } },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({ data: students, total, page, limit });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = studentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Inline ota-ona yaratish (agar ma'lumotlar berilgan bo'lsa)
      let parentId: string | undefined = d.parentId || undefined;

      if (!parentId && d.newParentName && d.newParentPhone) {
        const newParent = await tx.parent.create({
          data: {
            tenantId: user.tenantId,
            fullName: d.newParentName,
            phone: d.newParentPhone,
            telegramId: d.newParentTelegram || undefined,
          },
        });
        parentId = newParent.id;
      }

      const student = await tx.student.create({
        data: {
          tenantId: user.tenantId,
          fullName: d.fullName,
          phone: d.phone || undefined,
          birthDate: d.birthDate ? new Date(d.birthDate) : undefined,
          gender: d.gender as any,
          passportSeries: d.passportSeries || undefined,
          address: d.address || undefined,
          targetUniversity: d.targetUniversity || undefined,
          targetFaculty: d.targetFaculty || undefined,
          cardId: d.cardId || undefined,
          parentId,
          branchId: d.branchId || undefined,
          status: d.status,
          notes: d.notes || undefined,
        },
        include: { parent: true },
      });

      return student;
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: "CREATE_STUDENT",
        entity: "Student",
        entityId: result.id,
        changes: { created: result } as any,
      },
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Bu karta ID allaqachon mavjud" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}
