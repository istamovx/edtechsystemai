"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { parentCreateSchema, type ParentCreateInput } from "@/lib/validations/parent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parent?: any;
}

export function ParentFormDialog({ open, onOpenChange, parent }: Props) {
  const isEdit = !!parent;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ParentCreateInput>({
    resolver: zodResolver(parentCreateSchema),
    defaultValues: { fullName: "", phone: "", telegramId: "" },
  });

  useEffect(() => {
    if (parent) {
      reset({
        fullName: parent.fullName ?? "",
        phone: parent.phone ?? "",
        telegramId: parent.telegramId ?? "",
      });
    } else {
      reset({ fullName: "", phone: "", telegramId: "" });
    }
  }, [parent, open, reset]);

  const onSubmit = async (data: ParentCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/parents/${parent.id}` : "/api/parents";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ota-onani tahrirlash" : "Yangi ota-ona qo'shish"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>F.I.SH *</Label>
            <Input {...register("fullName")} placeholder="Aliyev Bekzod" />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div>
            <Label>Telefon *</Label>
            <Input {...register("phone")} placeholder="+998901234567" />
            <FieldError message={errors.phone?.message} />
          </div>

          <div>
            <Label>Telegram ID (ixtiyoriy)</Label>
            <Input {...register("telegramId")} placeholder="123456789" />
            <p className="mt-1 text-xs text-muted-foreground">
              Bot davomat va to'lov xabarlarini shu ID ga yuboradi
            </p>
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
