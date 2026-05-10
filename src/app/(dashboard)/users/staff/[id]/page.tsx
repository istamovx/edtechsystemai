import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, Shield, ShieldCheck, ShieldX, Activity, Clock, Calendar,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { Avatar } from "@/components/layout/Sidebar";
import { formatPhone, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  TENANT_OWNER: { label: "Markaz egasi", cls: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Administrator", cls: "bg-blue-100 text-blue-700" },
};

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) redirect("/dashboard");

  const member = await prisma.user.findFirst({
    where: {
      id: params.id,
      tenantId: user.tenantId,
      role: { in: ["ADMIN", "TENANT_OWNER"] },
    },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      isActive: true, lastLoginAt: true, createdAt: true,
    },
  });

  if (!member) notFound();

  const role = ROLE_LABELS[member.role];

  // So'nggi audit log'lar
  const recentActions = await prisma.auditLog.findMany({
    where: { tenantId: user.tenantId, userId: member.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { action: true, entity: true, createdAt: true },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/users/staff" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Xodim profili</h1>
          <p className="text-sm text-muted-foreground">Tizim foydalanuvchisi va aktivlik</p>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={member.name} size={80} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">{member.name}</h2>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${role?.cls}`}>
                <Shield size={12} className="mr-1" /> {role?.label}
              </span>
              {member.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <ShieldCheck size={12} /> Faol
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  <ShieldX size={12} /> Bloklangan
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{formatPhone(member.phone)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <span>Qo'shilgan: {formatDate(member.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-muted-foreground" />
                <span>So'nggi kirish: {member.lastLoginAt ? formatDate(member.lastLoginAt) : "Hech qachon"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit log */}
      <section className="card p-5">
        <h3 className="font-semibold flex items-center gap-2"><Activity size={16} /> So'nggi aktivlik</h3>
        {recentActions.length > 0 ? (
          <div className="mt-3 space-y-1">
            {recentActions.map((log, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-medium">
                    {log.action.split("_")[0][0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{translateAction(log.action)}</div>
                    <div className="text-xs text-muted-foreground">{log.entity}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Hech qanday aktivlik yo'q</p>
        )}
      </section>
    </div>
  );
}

function translateAction(action: string): string {
  const map: Record<string, string> = {
    CREATE_STUDENT: "O'quvchi qo'shdi",
    UPDATE_STUDENT: "O'quvchini yangiladi",
    DELETE_STUDENT: "O'quvchini o'chirdi",
    CREATE_TEACHER: "O'qituvchi qo'shdi",
    UPDATE_TEACHER: "O'qituvchini yangiladi",
    DELETE_TEACHER: "O'qituvchini o'chirdi",
    CREATE_PARENT: "Ota-ona qo'shdi",
    UPDATE_PARENT: "Ota-onani yangiladi",
    DELETE_PARENT: "Ota-onani o'chirdi",
    CREATE_STAFF: "Xodim qo'shdi",
    UPDATE_STAFF: "Xodimni yangiladi",
    DELETE_STAFF: "Xodimni o'chirdi",
    CREATE_PAYMENT: "To'lov qabul qildi",
    UPDATE_PAYMENT: "To'lovni yangiladi",
    DELETE_PAYMENT: "To'lovni o'chirdi",
  };
  return map[action] ?? action;
}
