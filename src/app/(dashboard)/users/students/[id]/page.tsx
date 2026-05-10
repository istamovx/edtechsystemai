import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, MapPin, Calendar, GraduationCap, CreditCard,
  CheckCircle2, Clock, BookOpen, Users, Award, Edit2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { formatPhone, formatUZS, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  LEAD: { label: "Lid", cls: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  PAUSED: { label: "To'xtatilgan", cls: "bg-yellow-100 text-yellow-700" },
  GRADUATED: { label: "Tugatgan", cls: "bg-blue-100 text-blue-700" },
  DROPPED: { label: "Tashlab ketgan", cls: "bg-red-100 text-red-700" },
};

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const user = await requireTenant();

  const student = await prisma.student.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      parent: true,
      branch: true,
      groups: { include: { group: { include: { course: true, teacher: true } } } },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
      attendances: { orderBy: { createdAt: "desc" }, take: 30, include: { lesson: true } },
      examAttempts: {
        orderBy: { startedAt: "desc" },
        take: 10,
        include: { exam: { select: { title: true } } },
      },
      certificates: { orderBy: { issuedAt: "desc" } },
    },
  });

  if (!student) notFound();

  const status = STATUS_LABELS[student.status];
  const totalPaid = student.payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalAttendances = student.attendances.length;
  const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/users" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">O'quvchi profili</h1>
          <p className="text-sm text-muted-foreground">Batafsil ma'lumot va aktivlik</p>
        </div>
      </div>

      {/* Hero card */}
      <section className="card p-6">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={student.fullName} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">{student.fullName}</h2>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status?.cls}`}>
                {status?.label}
              </span>
            </div>
            {student.targetUniversity && (
              <div className="mt-1 text-sm text-muted-foreground">
                🎓 {student.targetUniversity} {student.targetFaculty && `· ${student.targetFaculty}`}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {student.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{formatPhone(student.phone)}</span>
                </div>
              )}
              {student.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span>{formatDate(student.birthDate)}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span>{student.address}</span>
                </div>
              )}
              {student.cardId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Karta:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{student.cardId}</code>
                </div>
              )}
            </div>
          </div>
          <Link href={`/users?edit=${student.id}`}>
            <Button variant="outline">
              <Edit2 size={14} /> Tahrirlash
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatBox
          label="Jami to'langan"
          value={formatUZS(totalPaid)}
          icon={<CreditCard size={18} />}
          color="green"
        />
        <StatBox
          label="Davomat foizi"
          value={`${attendanceRate.toFixed(0)}%`}
          icon={<CheckCircle2 size={18} />}
          color="blue"
        />
        <StatBox
          label="Imtihon topshiriqlari"
          value={student.examAttempts.length.toString()}
          icon={<BookOpen size={18} />}
          color="purple"
        />
        <StatBox
          label="Sertifikatlar"
          value={student.certificates.length.toString()}
          icon={<Award size={18} />}
          color="amber"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Ota-ona */}
        <section className="card p-5">
          <h3 className="font-semibold flex items-center gap-2"><Users size={16} /> Ota-ona</h3>
          {student.parent ? (
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={student.parent.fullName} size={48} />
              <div className="flex-1">
                <div className="font-medium">{student.parent.fullName}</div>
                <div className="text-sm text-muted-foreground">{formatPhone(student.parent.phone)}</div>
                {student.parent.telegramId && (
                  <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    ✓ Telegram bog'langan
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Ota-ona bog'lanmagan</p>
          )}
        </section>

        {/* Guruhlar */}
        <section className="card p-5">
          <h3 className="font-semibold flex items-center gap-2"><GraduationCap size={16} /> Guruhlar</h3>
          {student.groups.length > 0 ? (
            <div className="mt-3 space-y-2">
              {student.groups.map((m) => (
                <div key={m.id} className="rounded-xl border border-border p-3">
                  <div className="font-medium">{m.group.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.group.course?.name ?? "Kurs"}
                    {m.group.teacher && ` · O'qituvchi: ${m.group.teacher.fullName}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Hech qanday guruhga qo'shilmagan</p>
          )}
        </section>

        {/* So'nggi to'lovlar */}
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><CreditCard size={16} /> So'nggi to'lovlar</h3>
            <Link href={`/payments?student=${student.id}`} className="text-xs text-brand-600">Barchasi →</Link>
          </div>
          {student.payments.length > 0 ? (
            <div className="mt-3 space-y-2">
              {student.payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <div className="font-medium">{formatUZS(Number(p.amount))}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.method} · {p.forMonth ?? formatDate(p.createdAt)}
                    </div>
                  </div>
                  <span className={`text-xs ${p.status === "PAID" ? "text-green-600" : "text-muted-foreground"}`}>
                    {p.status === "PAID" ? "✓" : p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Hali to'lovlar yo'q</p>
          )}
        </section>

        {/* Davomat (so'nggi 30 kun) */}
        <section className="card p-5">
          <h3 className="font-semibold flex items-center gap-2"><CheckCircle2 size={16} /> Davomat (30 kun)</h3>
          {student.attendances.length > 0 ? (
            <div className="mt-3 space-y-2">
              {student.attendances.slice(0, 7).map((a) => {
                const enter = a.enterAt ? new Date(a.enterAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : null;
                const exit = a.exitAt ? new Date(a.exitAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : null;
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <div className="text-sm font-medium">{formatDate(a.createdAt)}</div>
                      <div className="text-xs text-muted-foreground">
                        {enter && `🚪 ${enter}`} {exit && `→ ${exit}`}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "PRESENT" ? "bg-green-100 text-green-700" :
                      a.status === "LATE" ? "bg-yellow-100 text-yellow-700" :
                      a.status === "ABSENT" ? "bg-red-100 text-red-700" :
                      "bg-muted"
                    }`}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Davomat ma'lumotlari yo'q</p>
          )}
        </section>
      </div>

      {/* Imtihon natijalar */}
      <section className="card p-5">
        <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} /> Imtihon natijalari</h3>
        {student.examAttempts.length > 0 ? (
          <div className="mt-3 space-y-2">
            {student.examAttempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <div className="font-medium">{a.exam.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(a.startedAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {a.percent ? `${a.percent.toFixed(1)}%` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.score ?? "—"} / {a.maxScore ?? "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Hali imtihon topshirmagan</p>
        )}
      </section>

      {student.notes && (
        <section className="card p-5">
          <h3 className="font-semibold">📝 Ichki eslatmalar</h3>
          <p className="mt-2 text-sm whitespace-pre-wrap">{student.notes}</p>
        </section>
      )}
    </div>
  );
}

function StatBox({ label, value, icon, color }: any) {
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
    </div>
  );
}
