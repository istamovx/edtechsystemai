"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { staffCreateSchema, type StaffCreateInput } from "@/lib/validations/staff";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  staffMember?: any;
}

export function StaffFormDialog({ open, onOpenChange, staffMember }: Props) {
  const isEdit = !!staffMember;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<StaffCreateInput>({
    resolver: zodResolver(staffCreateSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", role: "ADMIN" },
  });

  useEffect(() => {
    if (staffMember) {
      reset({
        name: staffMember.name ?? "",
        email: staffMember.email ?? "",
        phone: staffMember.phone ?? "",
        password: "",
        role: staffMember.role ?? "ADMIN",
      });
    } else {
      reset({ name: "", email: "", phone: "", password: "", role: "ADMIN" });
    }
  }, [staffMember, open, reset]);

  const onSubmit = async (data: StaffCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/staff/${staffMember.id}` : "/api/staff";
      const method = isEdit ? "PATCH" : "POST";
      const payload: any = { ...data };
      if (isEdit && !payload.password) delete payload.password;
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
      toast.success(isEdit ? "Yangilandi" : "Qo'shildi", data.name);
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
          <DialogTitle>{isEdit ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Ism *</Label>
            <Input {...register("name")} placeholder="Karim Sodiqov" />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="admin@..." />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input {...register("phone")} placeholder="+998..." />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div>
            <Label>Parol {isEdit && "(o'zgartirmoqchi bo'lsangiz)"}</Label>
            <Input type="password" {...register("password")} placeholder={isEdit ? "Bo'sh qoldiring" : "Kamida 6 belgi"} />
            <FieldError message={errors.password?.message} />
          </div>

          <div>
            <Label>Rol</Label>
            <Select {...register("role")}>
              <option value="ADMIN">Administrator</option>
              <option value="TENANT_OWNER">Markaz egasi</option>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Markaz egasi: barcha sozlamalar va xodimlar boshqaruvi. Admin: kundalik operatsiyalar.
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
