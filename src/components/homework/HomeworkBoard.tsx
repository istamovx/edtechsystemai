"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Edit2, Trash2, BookOpen, Calendar, Users, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export function HomeworkBoard({ homeworks, groups }: { homeworks: any[]; groups: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", description: "", groupId: "", dueAt: "" });
  const [loading, setLoading] = useState(false);

  const openForm = (h: any | null) => {
    setEditTarget(h);
    if (h) setForm({
      title: h.title,
      description: h.description ?? "",
      groupId: h.groupId,
      dueAt: h.dueAt ? new Date(h.dueAt).toISOString().slice(0, 16) : "",
    });
    else setForm({ title: "", description: "", groupId: groups[0]?.id ?? "", dueAt: "" });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.groupId) {
      toast.error("Sarlavha va guruh shart");
      return;
    }
    setLoading(true);
    try {
      const url = editTarget ? `/api/homework/${editTarget.id}` : "/api/homework";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      toast.success(editTarget ? "Yangilandi" : "Vazifa berildi");
      setFormOpen(false);
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/homework/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("O'chirildi");
        setDeleteTarget(null);
        router.refresh();
      }
    } finally { setLoading(false); }
  };

  const isOverdue = (dueAt: string | null) => dueAt && new Date(dueAt) < new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => openForm(null)} disabled={groups.length === 0}>
          <Plus size={16} /> Yangi vazifa
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground">Avval guruh yarating</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hali vazifalar yo'q</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {homeworks.map((h) => {
            const overdue = isOverdue(h.dueAt);
            const total = h.group._count?.members ?? 0;
            const done = h._count?.submissions ?? 0;
            return (
              <div key={h.id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold flex-1 line-clamp-2">{h.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openForm(h)}>
                        <Edit2 size={14} /> Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive onClick={() => setDeleteTarget(h)}>
                        <Trash2 size={14} /> O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {h.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{h.description}</p>
                )}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-muted-foreground" />
                    <span>{h.group.name}</span>
                  </div>
                  {h.dueAt && (
                    <div className={`flex items-center gap-2 ${overdue ? "text-red-600" : "text-muted-foreground"}`}>
                      <Calendar size={12} />
                      <span>Muddat: {formatDate(h.dueAt)} {overdue && "(o'tib ketgan)"}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-600" />
                      <span className="font-medium">{done} / {total}</span>
                    </div>
                    <div className="text-muted-foreground">{((done / Math.max(total, 1)) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${(done / Math.max(total, 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Vazifani tahrirlash" : "Yangi vazifa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sarlavha *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Algebra 5-bob misollari" />
            </div>
            <div>
              <Label>Tavsif</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Guruh *</Label>
              <Select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}>
                <option value="">Tanlang</option>
                {groups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
              </Select>
            </div>
            <div>
              <Label>Topshirish muddati</Label>
              <Input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Bekor</Button>
            <Button onClick={save} loading={loading}>{editTarget ? "Saqlash" : "Berish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vazifani o'chirish</DialogTitle>
            <DialogDescription>"{deleteTarget?.title}" vazifasini o'chirasizmi?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Bekor</Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
