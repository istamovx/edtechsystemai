import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { ExamEditor } from "@/components/exams/ExamEditor";

export const dynamic = "force-dynamic";

export default async function ExamEditPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();

  const [exam, allQuestions, subjects] = await Promise.all([
    prisma.exam.findFirst({
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
      },
    }),
    prisma.examQuestion.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    }),
    prisma.subject.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!exam) notFound();

  return (
    <ExamEditor
      exam={JSON.parse(JSON.stringify(exam))}
      allQuestions={JSON.parse(JSON.stringify(allQuestions))}
      subjects={JSON.parse(JSON.stringify(subjects))}
    />
  );
}
