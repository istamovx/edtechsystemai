"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone, MoreVertical, Edit2, Trash2, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { formatPhone } from "@/lib/utils";

const STAGES = [
  { value: "NEW", label: "Yangi", border: "border-blue-300", bg: "bg-blue-50" },
  { value: "CONTACTED", label: "Bog'lanildi", border: "border-purple-300", bg: "bg-purple-50" },
  { value: "INTERESTED", label: "Qiziquvchi", border: "border-amber-300", bg: "bg-amber-50" },
  { value: "ENROLLED", label: "Ro'yxatdan o'tdi ✓", border: "border-green-300", bg: "bg-green-50" },
  { value: "LOST", label: "Yo'qotildi", border: "border-red-300", bg: "bg-red-50" },
];

export function CRMBoard({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", source: "", interestedIn: "", note: "" });
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = { NEW: [], CONTACTED: [], INTERESTED: [], ENROLLED: [], LOST: [] };
    leads.forEach((l) => { (map[l.status] || (map[l.status] = [])).push(l); });
    return map;
  }, [leads]);

  // Drag & Drop handlers
  const onDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDragOverStage(null);
  };

  const onDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  const onDragLeave = () => setDragOverStage(null);

  const onDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLeads((cur) => cur.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Rollback
        setLeads((cur) => cur.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)));
        const j = await res.json();
        toast.error("Xatolik", j.error);
        return;
      }
      if (newStatus === "ENROLLED") {
        toast.success("Ro'yxatdan o'tkazildi", "O'quvchilar ro'yxatiga avtomatik qo'shildi");
      } else {
        toast.success("Ko'chirildi", STAGES.find((s) => s.value === newStatus)?.label);
      }
      router.refresh();
    } catch {
      setLeads((cur) => cur.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)));
      toast.error("Tarmoq xatosi");
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
    if (!form.fullName || !form.phone) { toast.error("F.I.SH va telefon shart"); return; }
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
        <p className="text-sm text-muted-foreground">
          {leads.length} ta lid · 💡 Kartochkani tortib bosqichlar orasida ko'chiring
        </p>
        <Button onClick={() => openForm(null)}><Plus size={16} /> Yangi lid</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const items = grouped[stage.value] ?? [];
          const isOver = dragOverStage === stage.value;
          return (
            <div
              key={stage.value}
              onDragOver={(e) => onDragOver(e, stage.value)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, stage.value)}
              className={`rounded-2xl border-2 ${stage.border} ${stage.bg} p-3 transition ${
                isOver ? "ring-4 ring-brand-300 scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">{stage.label}</div>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-32">
                {items.map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, l.id)}
                    onDragEnd={onDragEnd}
                    className={`rounded-xl border border-border bg-card p-3 cursor-move group transition ${
                      draggedId === l.id ? "opacity-40 scale-95" : "hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground" />
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
                          <span className="mt-1.5 inline-block badge bg-blue-50 text-blue-700 text-[10px]">
                            {l.source}
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted shrink-0">
                            <MoreVertical size={12} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openForm(l)}>
                            <Edit2 size={14} /> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem destructive onClick={() => setDeleteTarget(l)}>
                            <Trash2 size={14} /> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {items.length === 0 && !isOver && (
                  <div className="text-xs text-muted-foreground text-center py-8 opacity-50">
                    Bu yerga sudrang
                  </div>
                )}
                {isOver && (
                  <div className="rounded-xl border-2 border-dashed border-brand-500 bg-brand-50 py-8 text-center text-sm text-brand-700 font-medium">
                    Bu yerga qo'yib yuboring
                  </div>
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
