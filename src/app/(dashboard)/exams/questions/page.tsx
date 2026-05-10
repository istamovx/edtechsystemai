import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { ExamsTabs } from "@/components/exams/ExamsTabs";
import { QuestionBank } from "@/components/exams/QuestionBank";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const user = await requireTenant();

  const [questions, subjects] = await Promise.all([
    prisma.examQuestion.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    }),
    prisma.subject.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      include: { topics: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Imtihonlar</h1>
        <p className="text-sm text-muted-foreground">Savollar bazasi — fanlar va mavzular bo'yicha</p>
      </div>

      <ExamsTabs />

      {/* Subjects overview */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {subjects.map((s: any) => (
          <div key={s.id} className="card p-4">
            <div className="text-sm font-medium">{s.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.topics.length} mavzu</div>
            <div className="mt-2 text-2xl font-semibold text-brand-600">
              {questions.filter((q) => q.subjectId === s.id).length}
            </div>
            <div className="text-xs text-muted-foreground">savol</div>
          </div>
        ))}
      </div>

      <QuestionBank
        subjects={JSON.parse(JSON.stringify(subjects))}
        initialQuestions={JSON.parse(JSON.stringify(questions))}
      />
    </div>
  );
}
