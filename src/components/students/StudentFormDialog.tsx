"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { studentCreateSchema, type StudentCreateInput } from "@/lib/validations/student";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: any; // null bo'lsa create, mavjud bo'lsa edit
}

export function StudentFormDialog({ open, onOpenChange, student }: Props) {
  const isEdit = !!student;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      birthDate: "",
      gender: undefined,
      passportSeries: "",
      address: "",
      targetUniversity: "",
      targetFaculty: "",
      cardId: "",
      status: "ACTIVE",
      notes: "",
    },
  });

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
      });
    } else {
      reset({
        fullName: "", phone: "", birthDate: "", gender: undefined, passportSeries: "",
        address: "", targetUniversity: "", targetFaculty: "", cardId: "", status: "ACTIVE", notes: "",
      });
    }
  }, [student, open, reset]);

  const onSubmit = async (data: StudentCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/students/${student.id}` : "/api/students";
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
      toast.success(isEdit ? "Yangilandi" : "Qo'shildi", `${data.fullName}`);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>F.I.SH *</Label>
              <Input {...register("fullName")} placeholder="Aliyev Doniyor" error={errors.fullName?.message} />
              <FieldError message={errors.fullName?.message} />
            </div>

            <div>
              <Label>Telefon</Label>
              <Input {...register("phone")} placeholder="+998901234567" error={errors.phone?.message} />
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
              <Input {...register("cardId")} placeholder="CARD-A001" error={errors.cardId?.message} />
              <FieldError message={errors.cardId?.message} />
            </div>

            <div>
              <Label>Holat</Label>
              <Select {...register("status")}>
                <option value="LEAD">Lid (qiziquvchi)</option>
                <option value="ACTIVE">Faol</option>
                <option value="PAUSED">To'xtatilgan</option>
                <option value="GRADUATED">Tugatgan</option>
                <option value="DROPPED">Tashlab ketgan</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label>Eslatmalar</Label>
              <Textarea {...register("notes")} placeholder="Ichki eslatmalar..." />
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
