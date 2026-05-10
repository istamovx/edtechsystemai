"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Users, Calendar, GraduationCap, BookOpen, Plus, X, UserPlus, Search,
} from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { WEEKDAYS } from "@/lib/validations/group";
import { formatPhone, formatDate } from "@/lib/utils";

const STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Tugagan", cls: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Bekor qilingan", cls: "bg-red-100 text-red-700" },
};

export function GroupDetail({ group, allStudents }: { group: any; allStudents: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const memberIds = group.members.map((m: any) => m.studentId);
  const availableStudents = allStudents.filter((s) => !memberIds.includes(s.id));

  const filtered = availableStudents.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.studentNumber?.includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const addMembers = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      const newIds = [...memberIds, ...selectedIds];
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: newIds }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      toast.success(`${selectedIds.length} ta o'quvchi qo'shildi`);
      setAddDialogOpen(false);
      setSelectedIds([]);
      setSearch("");
      router.refresh();
    } finally { setSaving(false); }
  };

  const removeMember = async (studentId: string, name: string) => {
    if (!confirm(`${name} ni guruhdan olib tashlaysizmi?`)) return;
    try {
      const newIds = memberIds.filter((id: string) => id !== studentId);
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: newIds }),
      });
      if (!res.ok) {
        const j = await res.json();
        toast.error("Xatolik", j.error);
        return;
      }
      toast.success("O'chirildi");
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    }
  };

  const status = STATUS[group.status];
  const days = (group.schedule as any)?.days as string[] | undefined;
  const startTime = (group.schedule as any)?.startTime;
  const endTime = (group.schedule as any)?.endTime;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/schedule" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <span className={`badge ${status?.cls}`}>{status?.label}</span>
          </div>
          {group.course && (
            <p className="text-sm text-muted-foreground">
              {group.course.name} {Number(group.course.price) > 0 && `· ${Number(group.course.price).toLocaleString("uz-UZ")} so'm`}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="A'zolar" value={group.members.length} icon={<Users size={18} />} color="blue" />
        <StatCard label="Darslar" value={group.lessons.length} icon={<BookOpen size={18} />} color="purple" />
        <StatCard label="O'qituvchi" value={group.teacher?.fullName ?? "—"} icon={<GraduationCap size={18} />} color="green" small />
        <StatCard label="Filial" value={group.branch?.name ?? "—"} icon={<Calendar size={18} />} color="amber" small />
      </div>

      {/* Schedule */}
      <section className="card p-5">
        <h3 className="font-semibold flex items-center gap-2"><Calendar size={16} /> Dars jadvali</h3>
        <div className="mt-3">
          {days && days.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {WEEKDAYS.map((d) => {
                  const active = days.includes(d.value);
                  return (
                    <span key={d.value} className={`grid h-9 w-9 place-items-center rounded-full text-xs font-medium ${
                      active ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {d.label}
                    </span>
                  );
                })}
              </div>
              {startTime && (
                <div className="text-sm font-medium">
                  ⏰ {startTime} – {endTime}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Jadval kiritilmagan</p>
          )}
        </div>
      </section>

      {/* Members */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users size={16} /> O'quvchilar ({group.members.length})
          </h3>
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <UserPlus size={14} /> Qo'shish
          </Button>
        </div>

        {group.members.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Users size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Hali o'quvchilar yo'q</p>
            <Button className="mt-3" size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus size={14} /> Birinchi o'quvchini qo'shing
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {group.members.map((m: any) => (
              <div key={m.id} className="group flex items-center gap-3 rounded-xl border border-border p-3">
                <Avatar name={m.student.fullName} size={36} />
                <Link href={`/users/students/${m.student.id}`} className="flex-1 min-w-0 hover:text-brand-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{m.student.fullName}</span>
                    {m.student.studentNumber && (
                      <code className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                        #{m.student.studentNumber}
                      </code>
                    )}
                  </div>
                  {m.student.phone && (
                    <div className="text-xs text-muted-foreground">{formatPhone(m.student.phone)}</div>
                  )}
                </Link>
                <button
                  onClick={() => removeMember(m.student.id, m.student.fullName)}
                  className="opacity-0 group-hover:opacity-100 grid h-8 w-8 place-items-center rounded-full text-red-500 hover:bg-red-50 transition"
                  title="O'chirish"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent lessons */}
      {group.lessons.length > 0 && (
        <section className="card p-5">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} /> So'nggi darslar</h3>
          <div className="mt-3 space-y-2">
            {group.lessons.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <div className="font-medium">{l.topic}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(l.startsAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add members dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>O'quvchilarni qo'shish</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              placeholder="F.I.SH, telefon yoki ID..."
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {availableStudents.length === 0 ? "Barcha o'quvchilar guruhda" : "Topilmadi"}
              </p>
            ) : (
              filtered.map((s) => {
                const sel = selectedIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      sel ? "border-brand-500 bg-brand-50/50" : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className={`grid h-5 w-5 place-items-center rounded border-2 shrink-0 ${
                      sel ? "border-brand-500 bg-brand-500 text-white" : "border-border"
                    }`}>
                      {sel && <span className="text-xs">✓</span>}
                    </div>
                    <Avatar name={s.fullName} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{s.fullName}</span>
                        {s.studentNumber && (
                          <code className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                            #{s.studentNumber}
                          </code>
                        )}
                      </div>
                      {s.phone && <div className="text-xs text-muted-foreground">{s.phone}</div>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <DialogFooter>
            <span className="text-sm text-muted-foreground mr-auto">{selectedIds.length} ta tanlandi</span>
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Bekor</Button>
            <Button onClick={addMembers} loading={saving} disabled={selectedIds.length === 0}>
              Qo'shish ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon, color, small }: any) {
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
      <div className={`mt-3 ${small ? "text-base" : "text-2xl"} font-semibold truncate`}>{value}</div>
    </div>
  );
}
