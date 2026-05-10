import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { studentCreateSchema } from "@/lib/validations/student";

// GET /api/students?q=search&status=ACTIVE&page=1
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

// POST /api/students
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
  const data = parsed.data;

  // Empty stringlarni undefined ga
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v])
  );

  try {
    const student = await prisma.student.create({
      data: {
        tenantId: user.tenantId,
        fullName: cleanData.fullName as string,
        phone: cleanData.phone as string | undefined,
        birthDate: cleanData.birthDate ? new Date(cleanData.birthDate as string) : undefined,
        gender: cleanData.gender as any,
        passportSeries: cleanData.passportSeries as string | undefined,
        address: cleanData.address as string | undefined,
        targetUniversity: cleanData.targetUniversity as string | undefined,
        targetFaculty: cleanData.targetFaculty as string | undefined,
        cardId: cleanData.cardId as string | undefined,
        parentId: cleanData.parentId as string | undefined,
        branchId: cleanData.branchId as string | undefined,
        status: (cleanData.status as any) ?? "ACTIVE",
        notes: cleanData.notes as string | undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: "CREATE_STUDENT",
        entity: "Student",
        entityId: student.id,
        changes: { created: student } as any,
      },
    });

    return NextResponse.json({ data: student }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Bu karta ID allaqachon mavjud" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}
