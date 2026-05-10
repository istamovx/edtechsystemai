"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, MoreVertical, Edit2, Trash2, BookOpen } from "lucide-react";
import { courseCreateSchema, type CourseCreateInput } from "@/lib/validations/group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { formatUZS } from "@/lib/utils";

export function CoursesTable({ courses }: { courses: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseCreateInput>({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: { name: "", description: "", duration: undefined, price: 0 },
  });

  const onSubmit = async (data: CourseCreateInput) => {
    setLoading(true);
    try {
      const url = editTarget ? `/api/courses/${editTarget.id}` : "/api/courses";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Xatolik", json.error);
        return;
      }
      toast.success(editTarget ? "Yangilandi" : "Kurs yaratildi");
      setFormOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("O'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } finally { setLoading(false); }
  };

  const openForm = (c: any | null) => {
    setEditTarget(c);
    if (c) reset({ name: c.name, description: c.description ?? "", duration: c.duration ?? undefined, price: Number(c.price) });
    else reset({ name: "", description: "", duration: undefined, price: 0 });
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => openForm(null)}><Plus size={16} /> Yangi kurs</Button>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hali kurslar yo'q</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold">{c.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
                      <MoreVertical size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openForm(c)}>
                      <Edit2 size={14} /> Tahrirlash
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setDeleteTarget(c)}>
                      <Trash2 size={14} /> O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-base">{formatUZS(Number(c.price))}</div>
                  {c.duration && <div className="text-muted-foreground">{c.duration} oy</div>}
                </div>
                <span className="badge bg-blue-50 text-blue-700">{c._count?.groups ?? 0} guruh</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Kursni tahrirlash" : "Yangi kurs"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input {...register("name")} placeholder="Matematika DTM tayyorlov" />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label>Tavsif</Label>
              <Textarea {...register("description")} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Davomiyligi (oy)</Label>
                <Input type="number" {...register("duration", { valueAsNumber: true })} placeholder="6" />
              </div>
              <div>
                <Label>Narx (so'm) *</Label>
                <Input type="number" {...register("price")} placeholder="800000" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Bekor</Button>
              <Button type="submit" loading={loading}>{editTarget ? "Saqlash" : "Yaratish"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kursni o'chirish</DialogTitle>
            <DialogDescription>{deleteTarget?.name} kursini o'chirasizmi?</DialogDescription>
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
