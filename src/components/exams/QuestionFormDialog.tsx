"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { questionCreateSchema, type QuestionCreateInput, QUESTION_TYPE_LABELS } from "@/lib/validations/exam";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  question?: any;
  preselectedSubjectId?: string;
  subjects: any[];
}

export function QuestionFormDialog({ open, onOpenChange, question, preselectedSubjectId, subjects }: Props) {
  const isEdit = !!question;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<QuestionCreateInput>({
    resolver: zodResolver(questionCreateSchema),
    defaultValues: {
      subjectId: preselectedSubjectId ?? "",
      topicId: "",
      text: "",
      type: "SINGLE_CHOICE",
      difficulty: 1,
      options: [
        { id: "A", text: "", isCorrect: false },
        { id: "B", text: "", isCorrect: false },
        { id: "C", text: "", isCorrect: false },
        { id: "D", text: "", isCorrect: false },
      ],
      explanation: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const selectedSubject = subjects.find((s) => s.id === watch("subjectId"));
  const questionType = watch("type");

  useEffect(() => {
    if (question) {
      reset({
        subjectId: question.subjectId,
        topicId: question.topicId ?? "",
        text: question.text,
        type: question.type,
        difficulty: question.difficulty,
        options: question.options ?? [],
        explanation: question.explanation ?? "",
      });
    } else {
      reset({
        subjectId: preselectedSubjectId ?? "",
        topicId: "",
        text: "",
        type: "SINGLE_CHOICE",
        difficulty: 1,
        options: [
          { id: "A", text: "", isCorrect: false },
          { id: "B", text: "", isCorrect: false },
          { id: "C", text: "", isCorrect: false },
          { id: "D", text: "", isCorrect: false },
        ],
        explanation: "",
      });
    }
  }, [question, open, reset, preselectedSubjectId]);

  const toggleCorrect = (idx: number) => {
    const opts = watch("options");
    if (questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE") {
      // Faqat bittasi
      setValue("options", opts.map((o, i) => ({ ...o, isCorrect: i === idx })));
    } else {
      setValue("options", opts.map((o, i) => i === idx ? { ...o, isCorrect: !o.isCorrect } : o));
    }
  };

  const onSubmit = async (data: QuestionCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/questions/${question.id}` : "/api/questions";
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
      toast.success(isEdit ? "Yangilandi" : "Savol qo'shildi");
      onOpenChange(false);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Savolni tahrirlash" : "Yangi savol"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Fan *</Label>
              <Select {...register("subjectId")}>
                <option value="">Tanlang</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              <FieldError message={errors.subjectId?.message} />
            </div>

            <div>
              <Label>Mavzu</Label>
              <Select {...register("topicId")}>
                <option value="">Tanlang (ixtiyoriy)</option>
                {selectedSubject?.topics?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Qiyinlik</Label>
              <Select {...register("difficulty", { valueAsNumber: true })}>
                <option value="1">⭐ Juda oson</option>
                <option value="2">⭐⭐ Oson</option>
                <option value="3">⭐⭐⭐ O'rta</option>
                <option value="4">⭐⭐⭐⭐ Qiyin</option>
                <option value="5">⭐⭐⭐⭐⭐ Juda qiyin</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Savol turi</Label>
            <Select {...register("type")}>
              {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Savol matni *</Label>
            <Textarea
              {...register("text")}
              placeholder="Misol: $\sqrt{16}$ ifodaning qiymatini hisoblang."
              rows={3}
            />
            <FieldError message={errors.text?.message} />
            <p className="mt-1 text-xs text-muted-foreground">
              💡 Formula uchun: <code className="bg-muted px-1 rounded">$x^2$</code>, <code className="bg-muted px-1 rounded">$\frac&#123;a&#125;&#123;b&#125;$</code>, <code className="bg-muted px-1 rounded">$\sqrt&#123;x&#125;$</code>
            </p>
          </div>

          {questionType !== "SHORT_TEXT" && (
            <div>
              <Label>Variantlar (to'g'ri javobni belgilang)</Label>
              <div className="mt-2 space-y-2">
                {fields.map((field, i) => {
                  const isCorrect = watch(`options.${i}.isCorrect`);
                  return (
                    <div key={field.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCorrect(i)}
                        className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${
                          isCorrect
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-border hover:border-brand-300"
                        }`}
                      >
                        {isCorrect ? <Check size={14} /> : <span className="text-xs">{watch(`options.${i}.id`)}</span>}
                      </button>
                      <Input
                        {...register(`options.${i}.text`)}
                        placeholder={`Variant ${watch(`options.${i}.id`)}`}
                        className="flex-1"
                      />
                      <input type="hidden" {...register(`options.${i}.id`)} />
                      {fields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="grid h-9 w-9 place-items-center rounded-full text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {fields.length < 6 && questionType !== "TRUE_FALSE" && (
                <button
                  type="button"
                  onClick={() => append({ id: String.fromCharCode(65 + fields.length), text: "", isCorrect: false })}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                >
                  <Plus size={14} /> Variant qo'shish
                </button>
              )}
              <FieldError message={(errors.options as any)?.message} />
            </div>
          )}

          <div>
            <Label>Tushuntirish (AI uchun foydali)</Label>
            <Textarea
              {...register("explanation")}
              placeholder="Yechilish bosqichlari yoki nima uchun shu javob to'g'ri..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" loading={loading}>{isEdit ? "Saqlash" : "Qo'shish"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
