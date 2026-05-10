"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone, MoreVertical, Edit2, Trash2, ArrowRight, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { formatPhone } from "@/lib/utils";

const STAGES = [
  { value: "NEW", label: "Yangi", cls: "bg-blue-50 border-blue-300 text-blue-700" },
  { value: "CONTACTED", label: "Bog'lanildi", cls: "bg-purple-50 border-purple-300 text-purple-700" },
  { value: "INTERESTED", label: "Qiziquvchi", cls: "bg-amber-50 border-amber-300 text-amber-700" },
  { value: "ENROLLED", label: "Ro'yxatdan o'tdi ✓", cls: "bg-green-50 border-green-300 text-green-700" },
  { value: "LOST", label: "Yo'qotildi", cls: "bg-red-50 border-red-300 text-red-700" },
];

export function CRMBoard({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", source: "", interestedIn: "", note: "" });
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = { NEW: [], CONTACTED: [], INTERESTED: [], ENROLLED: [], LOST: [] };
    initialLeads.forEach((l) => { (map[l.status] || (map[l.status] = [])).push(l); });
    return map;
  }, [initialLeads]);

  const moveStage = async (lead: any, status: string) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      if (status === "ENROLLED") {
        toast.success("Ro'yxatdan o'tkazildi", "O'quvchilar ro'yxatiga avtomatik qo'shildi");
      } else {
        toast.success("Bosqich o'zgardi");
      }
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    }
  };

  const openForm = (l: any | null) => {
    setEditTarget(l);
    if (l) setForm({
      fullName: l.fullName, phone: l.phone,
      source: l.source ?? "", interestedIn: l.interestedIn ?? "", note: l.note ?? "",
    });
    else setForm({ fullName: "", phone: "", source: "", interestedIn: "", note: "" });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.fullName || !form.phone) {
      toast.error("F.I.SH va telefon shart");
      return;
    }
    setLoading(true);
    try {
      const url = editTarget ? `/api/leads/${editTarget.id}` : "/api/leads";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { toast.error("Xatolik", json.error); return; }
      toast.success(editTarget ? "Yangilandi" : "Lid qo'shildi");
      setFormOpen(false);
      router.refresh();
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("O'chirildi");
        setDeleteTarget(null);
        router.refresh();
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{initialLeads.length} ta lid</p>
        <Button onClick={() => openForm(null)}><Plus size={16} /> Yangi lid</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const items = grouped[stage.value] ?? [];
          return (
            <div key={stage.value} className={`rounded-2xl border-2 ${stage.cls.split(" ")[1]} bg-muted/30 p-3`}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">{stage.label}</div>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-20">
                {items.map((l) => (
                  <div key={l.id} className="rounded-xl border border-border bg-card p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{l.fullName}</div>
                        <a href={`tel:${l.phone}`} className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                          <Phone size={10} /> {formatPhone(l.phone)}
                        </a>
                        {l.interestedIn && (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            🎯 {l.interestedIn}
                          </div>
                        )}
                        {l.source && (
                          <span className="mt-1 inline-block badge bg-blue-50 text-blue-700 text-[10px]">
                            {l.source}
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted">
                            <MoreVertical size={12} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openForm(l)}>
                            <Edit2 size={14} /> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {STAGES.filter((s) => s.value !== l.status).map((s) => (
                            <DropdownMenuItem key={s.value} onClick={() => moveStage(l, s.value)}>
                              <ArrowRight size={14} /> {s.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onClick={() => setDeleteTarget(l)}>
                            <Trash2 size={14} /> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">Bo'sh</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Lid tahrirlash" : "Yangi lid"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>F.I.SH *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998..." />
            </div>
            <div>
              <Label>Manba</Label>
              <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="">—</option>
                <option value="Instagram">Instagram</option>
                <option value="Telegram">Telegram</option>
                <option value="Facebook">Facebook</option>
                <option value="Tanish-bilish">Tanish-bilish</option>
                <option value="Reklama">Reklama</option>
                <option value="Boshqa">Boshqa</option>
              </Select>
            </div>
            <div>
              <Label>Qaysi yo'nalishga qiziqyapti</Label>
              <Input value={form.interestedIn} onChange={(e) => setForm({ ...form, interestedIn: e.target.value })} placeholder="Matematika, Ingliz tili..." />
            </div>
            <div>
              <Label>Eslatmalar</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
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
            <DialogTitle>Lidni o'chirish</DialogTitle>
            <DialogDescription>{deleteTarget?.fullName} ni o'chirasizmi?</DialogDescription>
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
