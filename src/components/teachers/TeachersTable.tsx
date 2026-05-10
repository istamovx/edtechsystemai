"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreVertical, Edit2, Trash2, GraduationCap, Eye } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/Dialog";
import { TeacherFormDialog } from "./TeacherFormDialog";
import { formatPhone, formatUZS } from "@/lib/utils";

interface Props {
  initialTeachers: any[];
  total: number;
  forceMentor?: boolean; // /users/mentors da true
  title?: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Nofaol", cls: "bg-yellow-100 text-yellow-700" },
  FIRED: { label: "Ishdan bo'shatilgan", cls: "bg-red-100 text-red-700" },
};

const SALARY_LABELS: Record<string, string> = {
  HOURLY: "Soatlik",
  MONTHLY: "Oylik",
  PERCENT: "Foizli",
};

export function TeachersTable({ initialTeachers, total, forceMentor }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = initialTeachers;
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.phone?.includes(q) ||
          (t.subjects ?? []).some((s: string) => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [initialTeachers, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teachers/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("O'chirildi", deleteTarget.fullName);
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full"
            placeholder="F.I.SH, telefon, fan..."
          />
        </div>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44 rounded-full">
          <option value="">Barchasi</option>
          <option value="ACTIVE">Faol</option>
          <option value="INACTIVE">Nofaol</option>
          <option value="FIRED">Ishdan bo'shatilgan</option>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} / {total}</span>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> {forceMentor ? "Yangi mentor" : "Yangi o'qituvchi"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <GraduationCap size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search || statusFilter ? "Hech narsa topilmadi" : forceMentor ? "Hali mentorlar yo'q" : "Hali o'qituvchilar yo'q"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-2xl">F.I.SH</th>
                  <th className="px-4 py-3 font-medium">Telefon</th>
                  <th className="px-4 py-3 font-medium">Fanlar</th>
                  <th className="px-4 py-3 font-medium">Maosh</th>
                  <th className="px-4 py-3 font-medium">Holat</th>
                  <th className="px-4 py-3 font-medium text-center">Guruhlar</th>
                  <th className="px-4 py-3 rounded-tr-2xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => {
                  const status = STATUS_LABELS[t.status];
                  return (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.fullName} size={32} />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {t.fullName}
                              {t.isMentor && <span className="badge bg-purple-100 text-purple-700 text-[10px]">Mentor</span>}
                            </div>
                            {t.bio && <div className="text-xs text-muted-foreground line-clamp-1">{t.bio}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatPhone(t.phone)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(t.subjects ?? []).slice(0, 3).map((s: string) => (
                            <span key={s} className="badge bg-blue-50 text-blue-700 text-[10px]">{s}</span>
                          ))}
                          {(t.subjects ?? []).length > 3 && (
                            <span className="text-xs text-muted-foreground">+{t.subjects.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-muted-foreground">{SALARY_LABELS[t.salaryType]}</div>
                        <div className="font-medium">
                          {t.salaryRate ? (t.salaryType === "PERCENT" ? `${t.salaryRate}%` : formatUZS(Number(t.salaryRate))) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status?.cls ?? "bg-muted"}`}>
                          {status?.label ?? t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{t._count?.groups ?? 0}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/users/${forceMentor ? "mentors" : "teachers"}/${t.id}`)}>
                              <Eye size={14} /> Profilini ko'rish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditTarget(t); setFormOpen(true); }}>
                              <Edit2 size={14} /> Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onClick={() => setDeleteTarget(t)}>
                              <Trash2 size={14} /> O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TeacherFormDialog open={formOpen} onOpenChange={setFormOpen} teacher={editTarget} forceMentor={forceMentor} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>O'qituvchini o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.fullName}</strong> ni butunlay o'chirmoqchimisiz? Guruhlar bog'lanmagan bo'lishi kerak.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
