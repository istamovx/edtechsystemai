import Link from "next/link";
import { Users, GraduationCap, CreditCard, BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { Avatar } from "@/components/layout/Sidebar";
import { formatUZS } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireTenant();
  const tenantId = user.tenantId;

  // Asosiy statistika — parallel
  const [studentsActive, teachersActive, paymentsThisMonth, examAttempts, recentStudents, recentExams] = await Promise.all([
    prisma.student.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.teacher.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: {
        tenantId,
        status: "PAID",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
    prisma.examAttempt.count({
      where: { tenantId, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.student.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, status: true, targetUniversity: true, createdAt: true },
    }),
    prisma.exam.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { attempts: true, questions: true } } },
    }),
  ]);

  const monthlyRevenue = paymentsThisMonth._sum.amount ? Number(paymentsThisMonth._sum.amount) : 0;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white">
        <div className="text-xs font-medium uppercase tracking-wider opacity-80">Salom!</div>
        <h1 className="mt-2 max-w-md text-3xl font-semibold leading-tight">
          {user.name} 👋
        </h1>
        <p className="mt-2 max-w-md opacity-90">O'quv markazingiz boshqaruv paneli</p>
        <div className="absolute -right-10 top-6 text-7xl opacity-30">✦</div>
      </section>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Faol o'quvchilar" value={studentsActive} icon={<Users size={18} />} href="/users" />
        <KpiCard label="O'qituvchilar" value={teachersActive} icon={<GraduationCap size={18} />} href="/users/teachers" />
        <KpiCard label="Bu oy tushum" value={formatUZS(monthlyRevenue)} icon={<CreditCard size={18} />} href="/payments" />
        <KpiCard label="So'nggi 7 kun testlar" value={examAttempts} icon={<BookOpen size={18} />} href="/exams" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent students */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">So'nggi o'quvchilar</h2>
            <Link href="/users" className="text-sm text-brand-600">Barchasi →</Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Hali o'quvchilar yo'q</p>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <Avatar name={s.fullName} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.targetUniversity || "Universitet kiritilmagan"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("uz-UZ")}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent exams */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Imtihonlar</h2>
            <Link href="/exams" className="text-sm text-brand-600">Barchasi →</Link>
          </div>
          {recentExams.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Hali imtihon yo'q</p>
              <Link href="/exams" className="mt-3 inline-block text-sm text-brand-600">Birinchi imtihonni yarating →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExams.map((e) => (
                <div key={e.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{e.title}</div>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>{e._count.questions} savol</span>
                        <span>{e._count.attempts} topshirilgan</span>
                      </div>
                    </div>
                    <Link href={`/exams/${e.id}`} className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, href }: { label: string; value: any; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="card p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </Link>
  );
}
