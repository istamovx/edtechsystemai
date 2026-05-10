import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Calendar, GraduationCap, DollarSign,
  Users, Edit2, BookOpen, CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { formatPhone, formatUZS, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Nofaol", cls: "bg-yellow-100 text-yellow-700" },
  FIRED: { label: "Ishdan bo'shatilgan", cls: "bg-red-100 text-red-700" },
};

const SALARY_LABELS: Record<string, string> = {
  HOURLY: "Soatlik",
  MONTHLY: "Oylik",
  PERCENT: "O'quvchi to'lovidan %",
};

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  const user = await requireTenant();

  const teacher = await prisma.teacher.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      groups: {
        include: {
          course: true,
          _count: { select: { members: true } },
        },
      },
      lessons: {
        orderBy: { startsAt: "desc" },
        take: 20,
        include: { group: true, _count: { select: { attendances: true } } },
      },
    },
  });

  if (!teacher) notFound();

  const status = STATUS_LABELS[teacher.status];
  const totalStudents = teacher.groups.reduce((s, g) => s + (g._count?.members ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={teacher.isMentor ? "/users/mentors" : "/users/teachers"} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{teacher.isMentor ? "Mentor" : "O'qituvchi"} profili</h1>
          <p className="text-sm text-muted-foreground">Batafsil ma'lumot va yuklama</p>
        </div>
      </div>

      {/* Hero card */}
      <section className="card p-6">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={teacher.fullName} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">{teacher.fullName}</h2>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status?.cls}`}>
                {status?.label}
              </span>
              {teacher.isMentor && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  Mentor
                </span>
              )}
            </div>
            {teacher.bio && <p className="mt-2 text-sm text-muted-foreground">{teacher.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {teacher.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{formatPhone(teacher.phone)}</span>
                </div>
              )}
              {teacher.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span>{formatDate(teacher.birthDate)}</span>
                </div>
              )}
              {teacher.cardId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Karta:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{teacher.cardId}</code>
                </div>
              )}
            </div>
            {teacher.subjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teacher.subjects.map((s) => (
                  <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link href={teacher.isMentor ? "/users/mentors" : "/users/teachers"}>
            <Button variant="outline">
              <Edit2 size={14} /> Tahrirlash
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatBox label="Guruhlar" value={teacher.groups.length.toString()} icon={<GraduationCap size={18} />} color="blue" />
        <StatBox label="O'quvchilar" value={totalStudents.toString()} icon={<Users size={18} />} color="purple" />
        <StatBox label="Darslar" value={teacher.lessons.length.toString()} icon={<BookOpen size={18} />} color="green" />
        <StatBox
          label="Maosh"
          value={
            teacher.salaryRate
              ? teacher.salaryType === "PERCENT"
                ? `${teacher.salaryRate}%`
                : formatUZS(Number(teacher.salaryRate))
              : "—"
          }
          icon={<DollarSign size={18} />}
          color="amber"
          subtitle={SALARY_LABELS[teacher.salaryType]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Guruhlar */}
        <section className="card p-5">
          <h3 className="font-semibold flex items-center gap-2"><GraduationCap size={16} /> Boshqaruvdagi guruhlar</h3>
          {teacher.groups.length > 0 ? (
            <div className="mt-3 space-y-2">
              {teacher.groups.map((g) => (
                <div key={g.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.course?.name ?? "Kurs"}
                        {" · "}{g._count?.members ?? 0} o'quvchi
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${g.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-muted"}`}>
                      {g.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Hech qanday guruhga biriktirilmagan</p>
          )}
        </section>

        {/* So'nggi darslar */}
        <section className="card p-5">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} /> So'nggi darslar</h3>
          {teacher.lessons.length > 0 ? (
            <div className="mt-3 space-y-2">
              {teacher.lessons.slice(0, 8).map((l) => (
                <div key={l.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{l.topic}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.group.name} · {formatDate(l.startsAt)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 size={12} /> {l._count?.attendances ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Hali darslar yo'q</p>
          )}
        </section>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color, subtitle }: any) {
  const colorCls = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  }[color];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${colorCls}`}>{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
  );
}
