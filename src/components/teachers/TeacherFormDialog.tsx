"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { teacherCreateSchema, type TeacherCreateInput, SUBJECTS } from "@/lib/validations/teacher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teacher?: any;
  forceMentor?: boolean; // Mentorlar tabidan ochilganda true
}

export function TeacherFormDialog({ open, onOpenChange, teacher, forceMentor }: Props) {
  const isEdit = !!teacher;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm<TeacherCreateInput>({
    resolver: zodResolver(teacherCreateSchema),
    defaultValues: {
      fullName: "", phone: "", birthDate: "", subjects: [],
      bio: "", isMentor: forceMentor ?? false,
      salaryType: "HOURLY", salaryRate: "", bonusPercent: "",
      cardId: "", status: "ACTIVE",
    },
  });

  const salaryType = watch("salaryType");

  useEffect(() => {
    if (teacher) {
      reset({
        fullName: teacher.fullName ?? "",
        phone: teacher.phone ?? "",
        birthDate: teacher.birthDate ? new Date(teacher.birthDate).toISOString().slice(0, 10) : "",
        subjects: teacher.subjects ?? [],
        bio: teacher.bio ?? "",
        isMentor: teacher.isMentor ?? false,
        salaryType: teacher.salaryType ?? "HOURLY",
        salaryRate: teacher.salaryRate?.toString() ?? "",
        bonusPercent: teacher.bonusPercent?.toString() ?? "",
        cardId: teacher.cardId ?? "",
        status: teacher.status ?? "ACTIVE",
      });
    } else {
      reset({
        fullName: "", phone: "", birthDate: "", subjects: [],
        bio: "", isMentor: forceMentor ?? false,
        salaryType: "HOURLY", salaryRate: "", bonusPercent: "",
        cardId: "", status: "ACTIVE",
      });
    }
  }, [teacher, open, reset, forceMentor]);

  const onSubmit = async (data: TeacherCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/teachers/${teacher.id}` : "/api/teachers";
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
          <DialogTitle>{isEdit ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>F.I.SH *</Label>
              <Input {...register("fullName")} placeholder="Karim Sodiqov" />
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

            <div className="sm:col-span-2">
              <Label>Mutaxassislik fanlar</Label>
              <Controller
                name="subjects"
                control={control}
                render={({ field }) => (
                  <div className="mt-1">
                    <MultiSelectChips options={SUBJECTS} value={field.value ?? []} onChange={field.onChange} />
                  </div>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Qisqacha (bio)</Label>
              <Textarea {...register("bio")} placeholder="O'qituvchi haqida..." rows={2} />
            </div>

            <div>
              <Label>Maosh turi</Label>
              <Select {...register("salaryType")}>
                <option value="HOURLY">Soatlik</option>
                <option value="MONTHLY">Oylik</option>
                <option value="PERCENT">O'quvchi to'lovidan %</option>
              </Select>
            </div>

            <div>
              <Label>{salaryType === "PERCENT" ? "Foiz (%)" : "Stavka (so'm)"}</Label>
              <Input
                type="number"
                {...register("salaryRate")}
                placeholder={salaryType === "PERCENT" ? "30" : "100000"}
              />
            </div>

            {salaryType !== "PERCENT" && (
              <div>
                <Label>Bonus foizi (ixtiyoriy)</Label>
                <Input type="number" {...register("bonusPercent")} placeholder="10" />
              </div>
            )}

            <div>
              <Label>RFID karta ID</Label>
              <Input {...register("cardId")} placeholder="CARD-T001" />
            </div>

            <div>
              <Label>Holat</Label>
              <Select {...register("status")}>
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Nofaol</option>
                <option value="FIRED">Ishdan bo'shatilgan</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isMentor")} className="h-4 w-4 rounded" />
                <span>Mentor sifatida belgilash (kuratorlik vazifasini bajaradi)</span>
              </label>
            </div>
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
