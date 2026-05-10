import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeExamWithAI } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  attemptId: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { attemptId } = schema.parse(body);

  // Tenant isolation tekshiruvi
  const tenantId = (session.user as any).tenantId;
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, tenantId },
    include: {
      exam: { include: { questions: { include: { question: { include: { subject: true, topic: true } } } } } },
      student: true,
    },
  });

  if (!attempt) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  // Javoblarni AI uchun tayyorlash
  const studentAnswers = (attempt.answers as any[]) ?? [];
  const answers = attempt.exam.questions.map((link) => {
    const sa = studentAnswers.find((a) => a.questionId === link.questionId);
    const opts = link.question.options as any[];
    const correctOpt = opts?.find((o) => o.isCorrect);
    return {
      question: link.question.text,
      options: opts?.map((o) => ({ id: o.id, text: o.text })),
      studentAnswer: sa?.answer ?? "(bo'sh)",
      correctAnswer: correctOpt?.text ?? "—",
      isCorrect: !!sa?.isCorrect,
      subject: link.question.subject.name,
      topic: link.question.topic?.name,
    };
  });

  const correctCount = answers.filter((a) => a.isCorrect).length;

  try {
    const analysis = await analyzeExamWithAI({
      studentName: attempt.student.fullName,
      totalQuestions: answers.length,
      correctCount,
      answers,
      targetUniversity: attempt.student.targetUniversity ?? undefined,
      targetFaculty: attempt.student.targetFaculty ?? undefined,
    });

    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: { aiAnalysis: analysis as any, status: "GRADED" },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "AI xatosi" }, { status: 500 });
  }
}
