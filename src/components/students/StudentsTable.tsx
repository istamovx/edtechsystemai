"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { StudentFormDialog } from "./StudentFormDialog";
import { formatPhone } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";

interface Props {
  initialStudents: any[];
  total: number;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  LEAD: { label: "Lid", cls: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  PAUSED: { label: "To'xtatilgan", cls: "bg-yellow-100 text-yellow-700" },
  GRADUATED: { label: "Tugatgan", cls: "bg-blue-100 text-blue-700" },
  DROPPED: { label: "Tashlab ketgan", cls: "bg-red-100 text-red-700" },
};

export function StudentsTable({ initialStudents, total }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = initialStudents;
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.phone?.includes(q) ||
          s.cardId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialStudents, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${deleteTarget.id}`, { method: "DELETE" });
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
            placeholder="F.I.SH, telefon, karta ID..."
          />
        </div>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44 rounded-full">
          <option value="">Barchasi</option>
          <option value="LEAD">Lidlar</option>
          <option value="ACTIVE">Faol</option>
          <option value="PAUSED">To'xtatilgan</option>
          <option value="GRADUATED">Tugatgan</option>
          <option value="DROPPED">Tashlab ketgan</option>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} / {total}</span>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Yangi o'quvchi
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground">
            {search || statusFilter ? "Hech narsa topilmadi" : "Hali o'quvchilar yo'q. Birinchisini qo'shing."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">F.I.SH</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Universitet</th>
                <th className="px-4 py-3 font-medium">Karta ID</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3 font-medium text-center">To'lov</th>
                <th className="px-4 py-3 font-medium text-center">Davomat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const status = STATUS_LABELS[s.status];
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.fullName} size={32} />
                        <div>
                          <div className="font-medium">{s.fullName}</div>
                          {s.targetFaculty && <div className="text-xs text-muted-foreground">{s.targetFaculty}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatPhone(s.phone)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.targetUniversity || "—"}</td>
                    <td className="px-4 py-3">
                      {s.cardId ? <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{s.cardId}</code> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status?.cls ?? "bg-muted"}`}>
                        {status?.label ?? s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s._count?.payments ?? 0}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s._count?.attendances ?? 0}</td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === s.id ? null : s.id)}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {actionMenuId === s.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} />
                          <div className="absolute right-4 top-12 z-40 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                            <button
                              onClick={() => { setEditTarget(s); setFormOpen(true); setActionMenuId(null); }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                              <Edit2 size={14} /> Tahrirlash
                            </button>
                            <button
                              onClick={() => { setActionMenuId(null); /* TODO: navigate to detail */ }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                              <Eye size={14} /> Profil
                            </button>
                            <div className="my-1 h-px bg-border" />
                            <button
                              onClick={() => { setDeleteTarget(s); setActionMenuId(null); }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} /> O'chirish
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} student={editTarget} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>O'quvchini o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.fullName}</strong> ni butunlay o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
              Barcha to'lovlar, davomat va imtihon natijalari ham o'chiriladi.
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
