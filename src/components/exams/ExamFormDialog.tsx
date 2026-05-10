"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { examCreateSchema, type ExamCreateInput } from "@/lib/validations/exam";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exam?: any;
}

export function ExamFormDialog({ open, onOpenChange, exam }: Props) {
  const isEdit = !!exam;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ExamCreateInput>({
    resolver: zodResolver(examCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      durationMin: 60,
      totalScore: 100,
      isPublished: false,
      showResults: true,
      startsAt: "",
      endsAt: "",
      questionIds: [],
    },
  });

  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title ?? "",
        description: exam.description ?? "",
        durationMin: exam.durationMin ?? 60,
        totalScore: exam.totalScore ?? 100,
        isPublished: exam.isPublished ?? false,
        showResults: exam.showResults ?? true,
        startsAt: exam.startsAt ? new Date(exam.startsAt).toISOString().slice(0, 16) : "",
        endsAt: exam.endsAt ? new Date(exam.endsAt).toISOString().slice(0, 16) : "",
        questionIds: [],
      });
    } else {
      reset({
        title: "", description: "", durationMin: 60, totalScore: 100,
        isPublished: false, showResults: true, startsAt: "", endsAt: "", questionIds: [],
      });
    }
  }, [exam, open, reset]);

  const onSubmit = async (data: ExamCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/exams/${exam.id}` : "/api/exams";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Xatolik", json.error || "Saqlash muvaffaqiyatsiz");
        return;
      }
      toast.success(isEdit ? "Yangilandi" : "Imtihon yaratildi");
      onOpenChange(false);
      // Yangi yaratilgan bo'lsa savol tanlash sahifasiga o'tish
      if (!isEdit && json.data?.id) {
        router.push(`/exams/${json.data.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Imtihonni tahrirlash" : "Yangi imtihon"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Imtihon nomi *</Label>
            <Input {...register("title")} placeholder="Masalan: Matematika - Algebra bo'yicha test" />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <Label>Tavsif (ixtiyoriy)</Label>
            <Textarea {...register("description")} placeholder="Imtihon haqida qisqa ma'lumot..." rows={2} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Davomiyligi (daqiqa) *</Label>
              <Input type="number" {...register("durationMin", { valueAsNumber: true })} min={1} max={600} />
              <FieldError message={errors.durationMin?.message} />
            </div>
            <div>
              <Label>Umumiy ball</Label>
              <Input type="number" {...register("totalScore", { valueAsNumber: true })} min={1} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Boshlanish vaqti (ixtiyoriy)</Label>
              <Input type="datetime-local" {...register("startsAt")} />
            </div>
            <div>
              <Label>Tugash vaqti (ixtiyoriy)</Label>
              <Input type="datetime-local" {...register("endsAt")} />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/30">
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" {...register("isPublished")} className="h-4 w-4 rounded" />
              <div>
                <div className="font-medium">Faollashtirilgan</div>
                <div className="text-xs text-muted-foreground">O'quvchilar imtihonni topshira oladi</div>
              </div>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" {...register("showResults")} className="h-4 w-4 rounded" defaultChecked />
              <div>
                <div className="font-medium">Natijalarni ko'rsatish</div>
                <div className="text-xs text-muted-foreground">O'quvchi topshirgach o'z natijasini ko'rishi mumkin</div>
              </div>
            </label>
          </div>

          {!isEdit && (
            <div className="rounded-xl bg-brand-50 p-3 flex items-start gap-3">
              <Sparkles size={16} className="text-brand-600 mt-0.5 shrink-0" />
              <p className="text-xs text-brand-900">
                Imtihon yaratilgach, savollar tanlash sahifasiga o'tasiz. Bu yerda savol bazasidan kerakli savollarni tanlaysiz.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" loading={loading}>{isEdit ? "Saqlash" : "Yaratish va savollar tanlash"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
