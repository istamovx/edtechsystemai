import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { examCreateSchema } from "@/lib/validations/exam";

export async function GET() {
  const user = await requireTenant();
  const exams = await prisma.exam.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });
  return NextResponse.json({ data: exams });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role) && user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = examCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  // Savollarning tenant'ga tegishli ekanini tekshirish
  if (d.questionIds.length > 0) {
    const count = await prisma.examQuestion.count({
      where: { id: { in: d.questionIds }, tenantId: user.tenantId },
    });
    if (count !== d.questionIds.length) {
      return NextResponse.json({ error: "Ba'zi savollar topilmadi" }, { status: 400 });
    }
  }

  const exam = await prisma.exam.create({
    data: {
      tenantId: user.tenantId,
      title: d.title,
      description: d.description || undefined,
      durationMin: d.durationMin,
      totalScore: d.totalScore,
      isPublished: d.isPublished,
      startsAt: d.startsAt ? new Date(d.startsAt) : undefined,
      endsAt: d.endsAt ? new Date(d.endsAt) : undefined,
      showResults: d.showResults,
      questions: {
        create: d.questionIds.map((qId, i) => ({
          questionId: qId,
          order: i + 1,
          points: 1,
        })),
      },
    },
    include: { questions: true },
  });

  return NextResponse.json({ data: exam }, { status: 201 });
}
