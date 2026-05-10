import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";

interface BulkQuestion {
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty?: number;
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role) && user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { questions, subjectId, topicId } = (await req.json()) as {
    questions: BulkQuestion[];
    subjectId: string;
    topicId?: string;
  };

  if (!subjectId || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "subjectId va questions kerak" }, { status: 400 });
  }

  // Tenant tekshiruvi
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, tenantId: user.tenantId },
  });
  if (!subject) return NextResponse.json({ error: "Fan topilmadi" }, { status: 404 });

  let saved = 0;
  let failed = 0;
  for (const q of questions) {
    if (!q.text || !q.options || q.options.length < 2) {
      failed++;
      continue;
    }
    const hasCorrect = q.options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      failed++;
      continue;
    }
    try {
      await prisma.examQuestion.create({
        data: {
          tenantId: user.tenantId,
          subjectId,
          topicId: topicId || undefined,
          text: q.text,
          type: "SINGLE_CHOICE",
          difficulty: Math.min(5, Math.max(1, q.difficulty ?? 2)),
          options: q.options as any,
          explanation: q.explanation || undefined,
        },
      });
      saved++;
    } catch (e) {
      failed++;
    }
  }

  return NextResponse.json({ success: true, saved, failed });
}
