"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { studentCreateSchema, type StudentCreateInput } from "@/lib/validations/student";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: any;
}

type ParentMode = "none" | "existing" | "new";

export function StudentFormDialog({ open, onOpenChange, student }: Props) {
  const isEdit = !!student;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const [parentMode, setParentMode] = useState<ParentMode>("none");

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: {
      fullName: "", phone: "", birthDate: "", gender: undefined,
      passportSeries: "", address: "", targetUniversity: "", targetFaculty: "",
      cardId: "", status: "ACTIVE", notes: "", parentId: "",
      newParentName: "", newParentPhone: "", newParentTelegram: "",
    },
  });

  // Modaldagi ota-onalar ro'yxati
  useEffect(() => {
    if (!open) return;
    fetch("/api/parents")
      .then((r) => r.json())
      .then((j) => setParents(j.data ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName ?? "",
        phone: student.phone ?? "",
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().slice(0, 10) : "",
        gender: student.gender ?? undefined,
        passportSeries: student.passportSeries ?? "",
        address: student.address ?? "",
        targetUniversity: student.targetUniversity ?? "",
        targetFaculty: student.targetFaculty ?? "",
        cardId: student.cardId ?? "",
        status: student.status ?? "ACTIVE",
        notes: student.notes ?? "",
        parentId: student.parentId ?? "",
        newParentName: "", newParentPhone: "", newParentTelegram: "",
      });
      setParentMode(student.parentId ? "existing" : "none");
    } else {
      reset({
        fullName: "", phone: "", birthDate: "", gender: undefined,
        passportSeries: "", address: "", targetUniversity: "", targetFaculty: "",
        cardId: "", status: "ACTIVE", notes: "", parentId: "",
        newParentName: "", newParentPhone: "", newParentTelegram: "",
      });
      setParentMode("none");
    }
  }, [student, open, reset]);

  const onSubmit = async (data: StudentCreateInput) => {
    // Parent mode bo'yicha tozalash
    const payload: any = { ...data };
    if (parentMode === "none") {
      delete payload.parentId;
      delete payload.newParentName;
      delete payload.newParentPhone;
      delete payload.newParentTelegram;
    } else if (parentMode === "existing") {
      delete payload.newParentName;
      delete payload.newParentPhone;
      delete payload.newParentTelegram;
    } else if (parentMode === "new") {
      delete payload.parentId;
      if (!payload.newParentName || !payload.newParentPhone) {
        toast.error("Ota-ona F.I.SH va telefon to'ldirilishi shart");
        return;
      }
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/students/${student.id}` : "/api/students";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Xatolik", json.error || "Saqlash muvaffaqiyatsiz");
        return;
      }
      toast.success(isEdit ? "Yangilandi" : "Qo'shildi", data.fullName);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Asosiy ma'lumotlar */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Asosiy ma'lumotlar</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>F.I.SH *</Label>
                <Input {...register("fullName")} placeholder="Aliyev Doniyor" />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div>
                <Label>Telefon</Label>
                <Input {...register("phone")} placeholder="+998901234567" />
                <FieldError message={errors.phone?.message} />
              </div>

              <div>
                <Label>Tug'ilgan sana</Label>
                <Input type="date" {...register("birthDate")} />
              </div>

              <div>
                <Label>Jinsi</Label>
                <Select {...register("gender")}>
                  <option value="">Tanlang</option>
                  <option value="MALE">Erkak</option>
                  <option value="FEMALE">Ayol</option>
                </Select>
              </div>

              <div>
                <Label>Pasport seriya</Label>
                <Input {...register("passportSeries")} placeholder="AA1234567" />
              </div>

              <div className="sm:col-span-2">
                <Label>Manzil</Label>
                <Input {...register("address")} placeholder="Toshkent, Mirzo Ulug'bek tumani..." />
              </div>
            </div>
          </div>

          {/* O'qish maqsadi */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">O'qish va karta</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Maqsad universitet</Label>
                <Input {...register("targetUniversity")} placeholder="TATU" />
              </div>
              <div>
                <Label>Maqsad fakultet</Label>
                <Input {...register("targetFaculty")} placeholder="Dasturiy injiniring" />
              </div>
              <div>
                <Label>RFID karta ID</Label>
                <Input {...register("cardId")} placeholder="CARD-001" />
              </div>
              <div>
                <Label>Holat</Label>
                <Select {...register("status")}>
                  <option value="LEAD">Lid</option>
                  <option value="ACTIVE">Faol</option>
                  <option value="PAUSED">To'xtatilgan</option>
                  <option value="GRADUATED">Tugatgan</option>
                  <option value="DROPPED">Tashlab ketgan</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Ota-ona */}
          <div>
            <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <Users size={16} /> Ota-ona ma'lumotlari
            </h3>
            <div className="mb-3 flex gap-1 rounded-full bg-muted p-1 w-fit">
              <button
                type="button"
                onClick={() => setParentMode("none")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${parentMode === "none" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                Yo'q
              </button>
              <button
                type="button"
                onClick={() => setParentMode("existing")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${parentMode === "existing" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                Mavjuddan tanlash
              </button>
              <button
                type="button"
                onClick={() => setParentMode("new")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${parentMode === "new" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                <UserPlus size={12} className="inline mr-1" /> Yangi qo'shish
              </button>
            </div>

            {parentMode === "existing" && (
              <div>
                <Label>Mavjud ota-ona</Label>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={parents.map((p) => ({
                        value: p.id,
                        label: p.fullName,
                        description: p.phone,
                        search: `${p.fullName} ${p.phone}`,
                      }))}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="— Tanlang —"
                      searchPlaceholder="Ota-ona F.I.SH yoki telefon..."
                      emptyText="Topilmadi"
                      clearable
                    />
                  )}
                />
                {parents.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hali ota-onalar yo'q. "Yangi qo'shish" tugmasini bosing.
                  </p>
                )}
              </div>
            )}

            {parentMode === "new" && (
              <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/30 p-4">
                <div className="sm:col-span-2">
                  <Label>Ota-ona F.I.SH *</Label>
                  <Input {...register("newParentName")} placeholder="Aliyev Bekzod" />
                </div>
                <div>
                  <Label>Telefon *</Label>
                  <Input {...register("newParentPhone")} placeholder="+998901234567" />
                </div>
                <div>
                  <Label>Telegram ID (ixtiyoriy)</Label>
                  <Input {...register("newParentTelegram")} placeholder="123456789" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bot orqali kundalik xabar olish uchun
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Eslatmalar */}
          <div>
            <Label>Ichki eslatmalar</Label>
            <Textarea {...register("notes")} placeholder="Faqat xodimlar ko'radi..." rows={2} />
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
