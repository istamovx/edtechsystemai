"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { groupCreateSchema, type GroupCreateInput, WEEKDAYS } from "@/lib/validations/group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group?: any;
  courses: any[];
  teachers: any[];
  branches: any[];
}

export function GroupFormDialog({ open, onOpenChange, group, courses, teachers, branches }: Props) {
  const isEdit = !!group;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<GroupCreateInput>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: {
      name: "", courseId: "", teacherId: "", branchId: "",
      startDate: "", endDate: "", status: "ACTIVE",
      scheduleDays: [], scheduleStartTime: "", scheduleEndTime: "",
    },
  });

  const days = watch("scheduleDays") ?? [];

  useEffect(() => {
    if (group) {
      reset({
        name: group.name ?? "",
        courseId: group.courseId ?? "",
        teacherId: group.teacherId ?? "",
        branchId: group.branchId ?? "",
        startDate: group.startDate ? new Date(group.startDate).toISOString().slice(0, 10) : "",
        endDate: group.endDate ? new Date(group.endDate).toISOString().slice(0, 10) : "",
        status: group.status ?? "ACTIVE",
        scheduleDays: (group.schedule as any)?.days ?? [],
        scheduleStartTime: (group.schedule as any)?.startTime ?? "",
        scheduleEndTime: (group.schedule as any)?.endTime ?? "",
      });
    } else {
      reset({
        name: "", courseId: "", teacherId: "", branchId: "",
        startDate: "", endDate: "", status: "ACTIVE",
        scheduleDays: [], scheduleStartTime: "", scheduleEndTime: "",
      });
    }
  }, [group, open, reset]);

  const toggleDay = (day: string) => {
    const cur = days || [];
    setValue("scheduleDays", cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]);
  };

  const onSubmit = async (data: GroupCreateInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/groups/${group.id}` : "/api/groups";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Xatolik", json.error);
        return;
      }
      toast.success(isEdit ? "Yangilandi" : "Guruh yaratildi");
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Guruhni tahrirlash" : "Yangi guruh"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Guruh nomi *</Label>
            <Input {...register("name")} placeholder="Matematika A1" />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Kurs</Label>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={courses.map((c) => ({ value: c.id, label: c.name, description: `${Number(c.price).toLocaleString("uz-UZ")} so'm` }))}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Kursni tanlang"
                    searchPlaceholder="Kurs nomi..."
                    clearable
                  />
                )}
              />
            </div>

            <div>
              <Label>O'qituvchi</Label>
              <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={teachers.map((t) => ({ value: t.id, label: t.fullName, description: t.subjects?.join(", ") }))}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="O'qituvchini tanlang"
                    searchPlaceholder="O'qituvchi..."
                    clearable
                  />
                )}
              />
            </div>

            <div>
              <Label>Filial</Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={branches.map((b) => ({ value: b.id, label: b.name, description: b.address }))}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Filial"
                    searchPlaceholder="Filial nomi..."
                    clearable
                  />
                )}
              />
            </div>

            <div>
              <Label>Holat</Label>
              <Select {...register("status")}>
                <option value="ACTIVE">Faol</option>
                <option value="COMPLETED">Tugagan</option>
                <option value="CANCELLED">Bekor qilingan</option>
              </Select>
            </div>

            <div>
              <Label>Boshlanish sanasi</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div>
              <Label>Tugash sanasi</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="text-sm font-semibold">Dars jadvali</div>
            <div>
              <Label>Hafta kunlari</Label>
              <div className="mt-1 flex gap-1.5">
                {WEEKDAYS.map((d) => {
                  const selected = days.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-medium transition ${
                        selected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border hover:border-brand-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Boshlanish vaqti</Label>
                <Input type="time" {...register("scheduleStartTime")} />
              </div>
              <div>
                <Label>Tugash vaqti</Label>
                <Input type="time" {...register("scheduleEndTime")} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" loading={loading}>{isEdit ? "Saqlash" : "Yaratish"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
