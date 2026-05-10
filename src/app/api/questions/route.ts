import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { questionCreateSchema } from "@/lib/validations/exam";

export async function GET(req: Request) {
  const user = await requireTenant();
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");
  const topicId = searchParams.get("topicId");
  const difficulty = searchParams.get("difficulty");
  const q = searchParams.get("q")?.trim() ?? "";

  const where: any = { tenantId: user.tenantId };
  if (subjectId) where.subjectId = subjectId;
  if (topicId) where.topicId = topicId;
  if (difficulty) where.difficulty = parseInt(difficulty);
  if (q) where.text = { contains: q, mode: "insensitive" };

  const questions = await prisma.examQuestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      subject: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: questions });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role) && user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = questionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  // Subject tenant tekshiruvi
  const subject = await prisma.subject.findFirst({
    where: { id: d.subjectId, tenantId: user.tenantId },
  });
  if (!subject) return NextResponse.json({ error: "Fan topilmadi" }, { status: 404 });

  // Kamida bitta to'g'ri javob bo'lsin
  if (d.type !== "SHORT_TEXT") {
    const correct = d.options.filter((o) => o.isCorrect);
    if (correct.length === 0) {
      return NextResponse.json({ error: "Kamida bitta variant to'g'ri bo'lsin" }, { status: 400 });
    }
    if (d.type === "SINGLE_CHOICE" && correct.length > 1) {
      return NextResponse.json({ error: "Bitta to'g'ri javob bo'lishi kerak" }, { status: 400 });
    }
  }

  const question = await prisma.examQuestion.create({
    data: {
      tenantId: user.tenantId,
      subjectId: d.subjectId,
      topicId: d.topicId || undefined,
      text: d.text,
      imageUrl: d.imageUrl || undefined,
      type: d.type,
      difficulty: d.difficulty,
      options: d.options as any,
      explanation: d.explanation || undefined,
    },
  });

  return NextResponse.json({ data: question }, { status: 201 });
}
