"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { paymentCreateSchema, type PaymentCreateInput, METHOD_LABELS } from "@/lib/validations/payment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payment?: any;
  preselectedStudentId?: string;
}

export function PaymentFormDialog({ open, onOpenChange, payment, preselectedStudentId }: Props) {
  const isEdit = !!payment;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<PaymentCreateInput>({
    resolver: zodResolver(paymentCreateSchema),
    defaultValues: {
      studentId: preselectedStudentId ?? "",
      amount: "",
      method: "CASH",
      status: "PAID",
      forMonth: new Date().toISOString().slice(0, 7),
      note: "",
      paidAt: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    fetch("/api/students?status=ACTIVE")
      .then((r) => r.json())
      .then((j) => setStudents(j.data ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (payment) {
      reset({
        studentId: payment.studentId,
        amount: payment.amount?.toString() ?? "",
        method: payment.method ?? "CASH",
        status: payment.status ?? "PAID",
        forMonth: payment.forMonth ?? "",
        note: payment.note ?? "",
        paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString().slice(0, 10) : "",
      });
    } else {
      reset({
        studentId: preselectedStudentId ?? "",
        amount: "",
        method: "CASH",
        status: "PAID",
        forMonth: new Date().toISOString().slice(0, 7),
        note: "",
        paidAt: "",
      });
    }
  }, [payment, open, reset, preselectedStudentId]);

  const onSubmit = async (data: PaymentCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/payments/${payment.id}` : "/api/payments";
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
      toast.success(isEdit ? "Yangilandi" : "To'lov qabul qilindi");
      onOpenChange(false);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setLoading(false);
    }
  };

  // SearchableSelect uchun options
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.fullName,
    description: s.phone ? `${s.phone}${s.targetUniversity ? ` · ${s.targetUniversity}` : ""}` : s.targetUniversity ?? "",
    search: `${s.fullName} ${s.phone ?? ""} ${s.cardId ?? ""}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "To'lovni tahrirlash" : "Yangi to'lov"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>O'quvchi *</Label>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={studentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="— Tanlang —"
                  searchPlaceholder="F.I.SH, telefon yoki karta..."
                  emptyText="O'quvchi topilmadi"
                  disabled={isEdit}
                  error={!!errors.studentId}
                />
              )}
            />
            <FieldError message={errors.studentId?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Summa (so'm) *</Label>
              <Input type="number" {...register("amount")} placeholder="800000" />
              <FieldError message={errors.amount?.message as string} />
            </div>
            <div>
              <Label>Oy uchun</Label>
              <Input type="month" {...register("forMonth")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>To'lov usuli</Label>
              <Select {...register("method")}>
                {Object.entries(METHOD_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Holat</Label>
              <Select {...register("status")}>
                <option value="PAID">To'langan</option>
                <option value="PENDING">Kutilmoqda</option>
                <option value="FAILED">Xato</option>
                <option value="REFUNDED">Qaytarilgan</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Izoh (ixtiyoriy)</Label>
            <Textarea {...register("note")} placeholder="Masalan: Sentyabr oylik to'lov" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" loading={loading}>{isEdit ? "Saqlash" : "Qabul qilish"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
