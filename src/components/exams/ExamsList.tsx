"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, BookOpen, Clock, Users, Sparkles, Eye, Edit2, MoreVertical, Trash2, Power, PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/Dialog";
import { ExamFormDialog } from "./ExamFormDialog";

export function ExamsList({ exams, subjects }: { exams: any[]; subjects: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/exams/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("Imtihon o'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
    }
  };

  const togglePublished = async (e: any) => {
    try {
      const res = await fetch(`/api/exams/${e.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !e.isPublished }),
      });
      if (!res.ok) {
        const j = await res.json();
        toast.error("Xatolik", j.error);
        return;
      }
      toast.success(e.isPublished ? "Imtihon o'chirildi" : "Imtihon faollashtirildi");
      router.refresh();
    } catch (err: any) {
      toast.error("Tarmoq xatosi", err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Imtihonlar ro'yxati</h2>
          <p className="text-sm text-muted-foreground">Yaratilgan testlar va ularning natijalari</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus size={16} /> Yangi imtihon
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hali imtihon yaratilmagan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            "Savollar bazasi" tabiga o'tib avval savollar qo'shing, keyin imtihon yarating
          </p>
          <Button className="mt-4" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Birinchi imtihonni yaratish
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <div key={e.id} className="card p-5 hover:shadow-md transition relative">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold flex-1 line-clamp-2">{e.title}</h3>
                <div className="flex items-center gap-1">
                  <span className={`badge text-[10px] ${
                    e.isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {e.isPublished ? "Faol" : "Loyiha"}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/exams/${e.id}/edit`)}>
                        <Edit2 size={14} /> Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setEditTarget(e); setFormOpen(true); }}>
                        <Edit2 size={14} /> Sozlamalar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublished(e)}>
                        {e.isPublished ? <><PowerOff size={14} /> O'chirish</> : <><Power size={14} /> Faollashtirish</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setDeleteTarget(e)}>
                        <Trash2 size={14} /> O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {e.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{e.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <BookOpen size={12} /> {e._count?.questions ?? 0}
                  </div>
                  <div className="text-muted-foreground">savol</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <Clock size={12} /> {e.durationMin}
                  </div>
                  <div className="text-muted-foreground">daq</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <Users size={12} /> {e._count?.attempts ?? 0}
                  </div>
                  <div className="text-muted-foreground">topshiriq</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/exams/${e.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye size={14} /> Ko'rish
                  </Button>
                </Link>
                <Link href={`/exams/${e.id}/edit`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Edit2 size={14} /> Savollar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">AI tahlil yoqilgan</h3>
            <p className="mt-1 text-sm opacity-90">
              O'quvchi imtihon topshirgach, Claude AI avtomatik tahlil qiladi:
              zaif mavzular, mos universitetlar, xato javoblar tushuntirishi.
            </p>
          </div>
        </div>
      </section>

      <ExamFormDialog open={formOpen} onOpenChange={setFormOpen} exam={editTarget} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Imtihonni o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.title}</strong> imtihonini o'chirasizmi?
              Bu amal qaytarib bo'lmaydi.
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
