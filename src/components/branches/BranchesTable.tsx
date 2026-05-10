"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Edit2, Trash2, Building2, MapPin, Phone, Users, GraduationCap, DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { formatPhone } from "@/lib/utils";

export function BranchesTable({ branches }: { branches: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const openForm = (b: any | null) => {
    setEditTarget(b);
    if (b) setForm({ name: b.name, address: b.address ?? "", phone: b.phone ?? "" });
    else setForm({ name: "", address: "", phone: "" });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.name) { toast.error("Nom kerak"); return; }
    setLoading(true);
    try {
      const url = editTarget ? `/api/branches/${editTarget.id}` : "/api/branches";
      const res = await fetch(url, {
        method: editTarget ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      toast.success(editTarget ? "Yangilandi" : "Filial qo'shildi");
      setFormOpen(false);
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/branches/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { toast.error("O'chirib bo'lmadi", json.error); return; }
      toast.success("O'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{branches.length} ta filial</p>
        <Button onClick={() => openForm(null)}><Plus size={16} /> Yangi filial</Button>
      </div>

      {branches.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hali filiallar yo'q</p>
          <Button className="mt-4" onClick={() => openForm(null)}>
            <Plus size={16} /> Birinchi filialni yarating
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Building2 size={18} />
                  </div>
                  <h3 className="font-semibold">{b.name}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
                      <MoreVertical size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openForm(b)}>
                      <Edit2 size={14} /> Tahrirlash
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setDeleteTarget(b)}>
                      <Trash2 size={14} /> O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5 text-xs">
                {b.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <span>{b.address}</span>
                  </div>
                )}
                {b.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={12} />
                    <a href={`tel:${b.phone}`} className="hover:text-brand-600">{formatPhone(b.phone)}</a>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2">
                  <Users size={14} className="mx-auto text-blue-600" />
                  <div className="mt-1 font-semibold">{b._count?.students ?? 0}</div>
                  <div className="text-muted-foreground">o'quvchi</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <GraduationCap size={14} className="mx-auto text-green-600" />
                  <div className="mt-1 font-semibold">{b._count?.groups ?? 0}</div>
                  <div className="text-muted-foreground">guruh</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <DoorOpen size={14} className="mx-auto text-purple-600" />
                  <div className="mt-1 font-semibold">{b._count?.rooms ?? 0}</div>
                  <div className="text-muted-foreground">xona</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Filialni tahrirlash" : "Yangi filial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Filial nomi *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Asosiy filial" />
            </div>
            <div>
              <Label>Manzil</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Toshkent, Mirzo Ulug'bek tumani..." />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 71 ..." />
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
            <DialogTitle>Filialni o'chirish</DialogTitle>
            <DialogDescription>{deleteTarget?.name} filialini o'chirasizmi?</DialogDescription>
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
