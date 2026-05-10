import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Send, Users, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { Avatar } from "@/components/layout/Sidebar";
import { formatPhone, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STUDENT_STATUS: Record<string, { label: string; cls: string }> = {
  LEAD: { label: "Lid", cls: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  PAUSED: { label: "To'xtatilgan", cls: "bg-yellow-100 text-yellow-700" },
  GRADUATED: { label: "Tugatgan", cls: "bg-blue-100 text-blue-700" },
  DROPPED: { label: "Tashlab ketgan", cls: "bg-red-100 text-red-700" },
};

export default async function ParentProfilePage({ params }: { params: { id: string } }) {
  const user = await requireTenant();

  const parent = await prisma.parent.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      children: {
        include: {
          _count: { select: { payments: true, attendances: true } },
        },
      },
    },
  });

  if (!parent) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/users/parents" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Ota-ona profili</h1>
          <p className="text-sm text-muted-foreground">Aloqa va farzandlari</p>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={parent.fullName} size={80} />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{parent.fullName}</h2>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-muted-foreground" />
                <span>{formatPhone(parent.phone)}</span>
              </div>
              {parent.telegramId ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Send size={14} />
                  <span>Telegram bog'langan</span>
                  <code className="rounded bg-green-50 px-1.5 py-0.5 text-xs">{parent.telegramId}</code>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Send size={14} />
                  <span>Telegram bog'lanmagan</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                Qo'shilgan: {formatDate(parent.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Farzandlar</div>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-semibold">{parent.children.length}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Telegram</div>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-600">
              <Send size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {parent.telegramId ? "✓ Bog'langan" : "—"}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Xabarnomalar</div>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {parent.telegramId ? "Yoqilgan" : "Yoqilmagan"}
          </div>
        </div>
      </div>

      {/* Farzandlar */}
      <section className="card p-5">
        <h3 className="font-semibold flex items-center gap-2"><Users size={16} /> Farzandlar</h3>
        {parent.children.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {parent.children.map((c) => {
              const st = STUDENT_STATUS[c.status];
              return (
                <Link
                  key={c.id}
                  href={`/users/students/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/30 transition"
                >
                  <Avatar name={c.fullName} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.targetUniversity ?? "Universitet kiritilmagan"}
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span>💳 {c._count?.payments ?? 0}</span>
                      <span>✓ {c._count?.attendances ?? 0}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st?.cls ?? "bg-muted"}`}>
                    {st?.label ?? c.status}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Bog'langan farzandlar yo'q</p>
        )}
      </section>

      {!parent.telegramId && (
        <div className="card p-5 bg-blue-50/50 border-blue-200">
          <h3 className="font-semibold text-blue-900">📱 Telegram orqali ulanish</h3>
          <p className="mt-2 text-sm text-blue-800">
            Bu ota-ona hali Telegram botiga ulanmagan. Ulanish uchun:
          </p>
          <ol className="mt-2 list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Botga kirsin: <code className="bg-white px-1 rounded">/start</code></li>
            <li>"👶 Farzandni bog'lash" tugmasini bossin</li>
            <li>Farzandi telefoni yoki ID sini yuborsin</li>
            <li>Ismi va telefonini tasdiqlasin</li>
          </ol>
          <p className="mt-2 text-sm text-blue-800">
            Bog'lanish tugagandan so'ng har kuni 20:00 da kundalik hisobot yuboriladi.
          </p>
        </div>
      )}
    </div>
  );
}
