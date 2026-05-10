import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { examCreateSchema } from "@/lib/validations/exam";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const exam = await prisma.exam.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: {
            include: {
              subject: { select: { id: true, name: true } },
              topic: { select: { id: true, name: true } },
            },
          },
        },
      },
      _count: { select: { attempts: true } },
    },
  });
  if (!exam) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ data: exam });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role) && user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const existing = await prisma.exam.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = examCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const data: any = {};
  if (d.title) data.title = d.title;
  if (d.description !== undefined) data.description = d.description || null;
  if (d.durationMin !== undefined) data.durationMin = d.durationMin;
  if (d.totalScore !== undefined) data.totalScore = d.totalScore;
  if (d.isPublished !== undefined) data.isPublished = d.isPublished;
  if (d.startsAt !== undefined) data.startsAt = d.startsAt ? new Date(d.startsAt) : null;
  if (d.endsAt !== undefined) data.endsAt = d.endsAt ? new Date(d.endsAt) : null;
  if (d.showResults !== undefined) data.showResults = d.showResults;

  // Savollar yangilash — agar berilgan bo'lsa
  if (d.questionIds !== undefined) {
    // Avval barcha bog'lashlarni o'chirish
    await prisma.examQuestionLink.deleteMany({ where: { examId: params.id } });
    // Yangi tanlangan savollarni biriktirish
    if (d.questionIds.length > 0) {
      // Tenant tekshiruvi
      const count = await prisma.examQuestion.count({
        where: { id: { in: d.questionIds }, tenantId: user.tenantId },
      });
      if (count !== d.questionIds.length) {
        return NextResponse.json({ error: "Ba'zi savollar topilmadi" }, { status: 400 });
      }
      await prisma.examQuestionLink.createMany({
        data: d.questionIds.map((qId, i) => ({
          examId: params.id,
          questionId: qId,
          order: i + 1,
          points: 1,
        })),
      });
    }
  }

  const updated = await prisma.exam.update({
    where: { id: params.id },
    data,
    include: { questions: { include: { question: true } }, _count: { select: { attempts: true } } },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.exam.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: { _count: { select: { attempts: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  if (existing._count.attempts > 0) {
    return NextResponse.json({
      error: `Bu imtihonga ${existing._count.attempts} ta topshiriq bor. Avval ularni saqlang.`
    }, { status: 409 });
  }

  await prisma.exam.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
