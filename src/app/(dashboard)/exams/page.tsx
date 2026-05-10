import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { ExamsTabs } from "@/components/exams/ExamsTabs";
import { ExamsList } from "@/components/exams/ExamsList";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const user = await requireTenant();

  const [exams, subjects] = await Promise.all([
    prisma.exam.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true, attempts: true } } },
    }),
    prisma.subject.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      include: { _count: { select: { questions: true } } },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Imtihonlar</h1>
        <p className="text-sm text-muted-foreground">AI tahlil bilan testlar va savol bazasi</p>
      </div>

      <ExamsTabs />

      <ExamsList exams={JSON.parse(JSON.stringify(exams))} subjects={subjects} />
    </div>
  );
}
