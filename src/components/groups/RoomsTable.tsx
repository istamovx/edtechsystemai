"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Edit2, Trash2, DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";

export function RoomsTable({ rooms, branches }: { rooms: any[]; branches: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", capacity: "", branchId: "" });
  const [loading, setLoading] = useState(false);

  const openForm = (r: any | null) => {
    setEditTarget(r);
    if (r) setForm({ name: r.name, capacity: r.capacity?.toString() ?? "", branchId: r.branchId });
    else setForm({ name: "", capacity: "", branchId: branches[0]?.id ?? "" });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.branchId) {
      toast.error("Nom va filial shart");
      return;
    }
    setLoading(true);
    try {
      const url = editTarget ? `/api/rooms/${editTarget.id}` : "/api/rooms";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      toast.success(editTarget ? "Yangilandi" : "Xona qo'shildi");
      setFormOpen(false);
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      toast.success("O'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rooms.length} ta xona</p>
        <Button onClick={() => openForm(null)} disabled={branches.length === 0}>
          <Plus size={16} /> Yangi xona
        </Button>
      </div>

      {branches.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground">Avval filial yarating</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card p-12 text-center">
          <DoorOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hali xonalar yo'q</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {rooms.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <div className="text-xs text-muted-foreground">{r.branch.name}</div>
                  {r.capacity && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Sig'imi: {r.capacity} kishi
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
                      <MoreVertical size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openForm(r)}>
                      <Edit2 size={14} /> Tahrirlash
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setDeleteTarget(r)}>
                      <Trash2 size={14} /> O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {r._count?.lessons ?? 0} ta dars rejalashtirilgan
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Xonani tahrirlash" : "Yangi xona"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="201" />
            </div>
            <div>
              <Label>Sig'imi (kishi)</Label>
              <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="20" />
            </div>
            <div>
              <Label>Filial *</Label>
              <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                <option value="">Tanlang</option>
                {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Bekor</Button>
            <Button onClick={save} loading={loading}>{editTarget ? "Saqlash" : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xonani o'chirish</DialogTitle>
            <DialogDescription>{deleteTarget?.name} xonasini o'chirasizmi?</DialogDescription>
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
