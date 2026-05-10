import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Clock, Hash, Users, Calendar, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/validations/exam";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();

  const exam = await prisma.exam.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: {
            include: {
              subject: { select: { name: true } },
              topic: { select: { name: true } },
            },
          },
        },
      },
      attempts: {
        orderBy: { startedAt: "desc" },
        take: 10,
        include: { student: { select: { id: true, fullName: true } } },
      },
      _count: { select: { attempts: true } },
    },
  });

  if (!exam) notFound();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/exams" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{exam.title}</h1>
              <span className={`badge ${
                exam.isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
              }`}>
                {exam.isPublished ? "Faol" : "Loyiha"}
              </span>
            </div>
            {exam.description && (
              <p className="mt-1 text-sm text-muted-foreground">{exam.description}</p>
            )}
          </div>
        </div>
        <Link href={`/exams/${exam.id}/edit`}>
          <Button>
            <Edit2 size={14} /> Tahrirlash
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatBox label="Savollar" value={exam.questions.length.toString()} icon={<Hash size={18} />} />
        <StatBox label="Davomiyligi" value={`${exam.durationMin} daq`} icon={<Clock size={18} />} />
        <StatBox label="Topshirgan" value={exam._count.attempts.toString()} icon={<Users size={18} />} />
        <StatBox
          label="Holat"
          value={exam.isPublished ? "Faol" : "Loyiha"}
          icon={<Eye size={18} />}
        />
      </div>

      {/* Settings */}
      <section className="card p-5">
        <h3 className="font-semibold">Sozlamalar</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Boshlanish" value={exam.startsAt ? formatDate(exam.startsAt) : "—"} />
          <Field label="Tugash" value={exam.endsAt ? formatDate(exam.endsAt) : "—"} />
          <Field label="Umumiy ball" value={exam.totalScore.toString()} />
          <Field label="Natijalarni ko'rsatish" value={exam.showResults ? "Ha" : "Yo'q"} />
        </div>
      </section>

      {/* Questions */}
      <section className="card p-5">
        <h3 className="font-semibold mb-3">Savollar ({exam.questions.length})</h3>
        {exam.questions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Hali savollar tanlanmagan</p>
            <Link href={`/exams/${exam.id}/edit`} className="mt-3 inline-block text-sm text-brand-600 hover:underline">
              + Savollar qo'shish
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {exam.questions.map((link: any, i: number) => {
              const q = link.question;
              const diff = DIFFICULTY_LABELS[q.difficulty];
              return (
                <div key={link.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700 text-sm font-semibold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="badge bg-brand-50 text-brand-700">{q.subject.name}</span>
                        {q.topic && <span className="badge bg-blue-50 text-blue-700">{q.topic.name}</span>}
                        <span className={`badge ${diff?.cls}`}>{diff?.label}</span>
                        <span className="badge bg-muted text-muted-foreground">{QUESTION_TYPE_LABELS[q.type]}</span>
                      </div>
                      <p className="text-sm font-medium mb-2">{q.text}</p>
                      {Array.isArray(q.options) && (
                        <div className="grid gap-1 text-xs sm:grid-cols-2">
                          {q.options.map((o: any) => (
                            <div
                              key={o.id}
                              className={o.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}
                            >
                              {o.id}) {o.text} {o.isCorrect && "✓"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent attempts */}
      {exam.attempts.length > 0 && (
        <section className="card p-5">
          <h3 className="font-semibold mb-3">So'nggi topshiriqlar</h3>
          <div className="space-y-2">
            {exam.attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <Link href={`/users/students/${a.student.id}`} className="font-medium hover:text-brand-600">
                    {a.student.fullName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{formatDate(a.startedAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{a.percent ? `${a.percent.toFixed(1)}%` : "—"}</div>
                  <div className="text-xs text-muted-foreground">{a.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
