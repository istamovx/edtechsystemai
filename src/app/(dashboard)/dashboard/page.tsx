import { cookies } from "next/headers";
import Link from "next/link";
import {
  Users, GraduationCap, CreditCard, BookOpen, Calendar, CheckCircle2, AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { Avatar } from "@/components/layout/Sidebar";
import { formatUZS } from "@/lib/utils";
import { ROLE_DASHBOARD_TITLE } from "@/lib/role-modules";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireTenant();
  const role = cookies().get("__demo_role__")?.value ?? user.role;
  const tenantId = user.tenantId;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  // Rolga qarab turli dashboardlar
  if (role === "STUDENT") return <StudentDashboard userName={user.name ?? ""} />;
  if (role === "PARENT") return <ParentDashboard userName={user.name ?? ""} />;
  if (role === "TEACHER" || role === "MENTOR") {
    return <TeacherDashboard tenantId={tenantId} userName={user.name ?? ""} role={role} />;
  }

  // ADMIN / TENANT_OWNER / SUPER_ADMIN
  const [studentsActive, teachersActive, paymentsThisMonth, examAttempts, recentStudents, recentExams] = await Promise.all([
    prisma.student.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.teacher.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { tenantId, status: "PAID", createdAt: { gte: startOfMonth } },
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white">
        <div className="text-xs font-medium uppercase tracking-wider opacity-80">{ROLE_DASHBOARD_TITLE[role] ?? "Dashboard"}</div>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">Salom, {user.name} 👋</h1>
        <p className="mt-2 max-w-md opacity-90">O'quv markazingiz boshqaruv paneli</p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Faol o'quvchilar" value={studentsActive} icon={<Users size={18} />} href="/users" />
        <KpiCard label="O'qituvchilar" value={teachersActive} icon={<GraduationCap size={18} />} href="/users/teachers" />
        <KpiCard label="Bu oy tushum" value={formatUZS(monthlyRevenue)} icon={<CreditCard size={18} />} href="/payments" />
        <KpiCard label="So'nggi 7 kun testlar" value={examAttempts} icon={<BookOpen size={18} />} href="/exams" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
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
                <Link key={s.id} href={`/users/students/${s.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/30">
                  <Avatar name={s.fullName} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.targetUniversity || "Universitet kiritilmagan"}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Imtihonlar</h2>
            <Link href="/exams" className="text-sm text-brand-600">Barchasi →</Link>
          </div>
          {recentExams.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Hali imtihon yo'q</p>
          ) : (
            <div className="space-y-2">
              {recentExams.map((e) => (
                <div key={e.id} className="rounded-xl border border-border p-3">
                  <div className="font-medium">{e.title}</div>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>{e._count.questions} savol</span>
                    <span>{e._count.attempts} topshirilgan</span>
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

// O'QITUVCHI / MENTOR
async function TeacherDashboard({ tenantId, userName, role }: { tenantId: string; userName: string; role: string }) {
  const [groups, lessons] = await Promise.all([
    prisma.group.findMany({
      where: { tenantId, status: "ACTIVE" },
      take: 6,
      include: { _count: { select: { members: true } } },
    }),
    prisma.lesson.count({ where: { tenantId, startsAt: { gte: new Date() } } }),
  ]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
        <div className="text-xs uppercase opacity-80">{role === "MENTOR" ? "Mentor paneli" : "O'qituvchi paneli"}</div>
        <h1 className="mt-2 text-3xl font-semibold">Salom, {userName} 👋</h1>
        <p className="mt-2 opacity-90">Sizning guruhlaringiz va darslaringiz</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Mening guruhlarim" value={groups.length} icon={<GraduationCap size={18} />} href="/schedule" />
        <KpiCard label="Bo'lajak darslar" value={lessons} icon={<Calendar size={18} />} href="/schedule" />
        <KpiCard label="Imtihonlar" value="—" icon={<BookOpen size={18} />} href="/exams" />
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Guruhlar</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hali guruhlar yo'q</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <Link key={g.id} href={`/schedule/${g.id}`} className="rounded-xl border border-border p-4 hover:shadow-md transition">
                <div className="font-medium">{g.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">👥 {g._count.members} o'quvchi</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// O'QUVCHI
function StudentDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-8 text-white">
        <div className="text-xs uppercase opacity-80">O'quvchi paneli</div>
        <h1 className="mt-2 text-3xl font-semibold">Salom, {userName} 👨‍🎓</h1>
        <p className="mt-2 opacity-90">Vazifalar, imtihonlar va dars jadvali</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Imtihonlar" value="—" icon={<BookOpen size={18} />} href="/exams" />
        <KpiCard label="Vazifalar" value="—" icon={<CheckCircle2 size={18} />} href="/homework" />
        <KpiCard label="Dars jadvali" value="—" icon={<Calendar size={18} />} href="/schedule" />
      </div>

      <section className="card p-5">
        <h2 className="font-semibold">Bugungi darslar</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O'quvchi rejimida shaxsiy ma'lumotlar ko'rsatiladi: vaqti kelgan imtihonlar, topshirish kerak bo'lgan vazifalar, dars jadvali.
        </p>
      </section>
    </div>
  );
}

// OTA-ONA
function ParentDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-white">
        <div className="text-xs uppercase opacity-80">Ota-ona paneli</div>
        <h1 className="mt-2 text-3xl font-semibold">Salom, {userName} 👨‍👩‍👧</h1>
        <p className="mt-2 opacity-90">Farzandingizning kundalik faoliyati</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-muted-foreground">Farzandlar</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-muted-foreground">Bugungi davomat</div>
          <div className="mt-2 text-2xl font-semibold flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            <span>—</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-muted-foreground">Qarzdorlik</div>
          <div className="mt-2 text-2xl font-semibold flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <span>—</span>
          </div>
        </div>
      </div>

      <section className="card p-5 bg-blue-50 border-blue-200">
        <h2 className="font-semibold flex items-center gap-2">📱 Telegram bot</h2>
        <p className="mt-2 text-sm text-blue-900">
          Kundalik xabarlar olish uchun Telegram bot orqali ulaning. Farzandingizning <code>#XXXXXX</code> ID raqamini botga yuboring.
        </p>
      </section>
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
