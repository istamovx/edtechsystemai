"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit2, Trash2, Users, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/Dialog";
import { GroupFormDialog } from "./GroupFormDialog";
import { WEEKDAYS } from "@/lib/validations/group";

interface Props {
  groups: any[];
  courses: any[];
  teachers: any[];
  branches: any[];
}

const STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Tugagan", cls: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Bekor qilingan", cls: "bg-red-100 text-red-700" },
};

export function GroupsTable({ groups, courses, teachers, branches }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.course?.name?.toLowerCase().includes(q) ||
        g.teacher?.fullName?.toLowerCase().includes(q)
    );
  }, [groups, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("Guruh o'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDays = (days: string[] | undefined) => {
    if (!days || days.length === 0) return "—";
    return days.map((d) => WEEKDAYS.find((w) => w.value === d)?.label ?? d).join(", ");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full"
            placeholder="Guruh, kurs yoki o'qituvchi..."
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length}</span>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Yangi guruh
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <GraduationCap size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{search ? "Topilmadi" : "Hali guruhlar yo'q"}</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const st = STATUS[g.status];
            const days = (g.schedule as any)?.days as string[] | undefined;
            const startTime = (g.schedule as any)?.startTime;
            const endTime = (g.schedule as any)?.endTime;
            return (
              <div key={g.id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{g.name}</h3>
                    {g.course && (
                      <div className="text-xs text-muted-foreground truncate">{g.course.name}</div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/schedule/${g.id}`)}>
                        <Users size={14} /> A'zolar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setEditTarget(g); setFormOpen(true); }}>
                        <Edit2 size={14} /> Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setDeleteTarget(g)}>
                        <Trash2 size={14} /> O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1 text-xs">
                  {g.teacher && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap size={12} />
                      <span>{g.teacher.fullName}</span>
                    </div>
                  )}
                  {(days?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={12} />
                      <span>{formatDays(days)} {startTime && `· ${startTime}-${endTime}`}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>👥 {g._count?.members ?? 0}</span>
                    <span>📚 {g._count?.lessons ?? 0}</span>
                  </div>
                  <span className={`badge ${st?.cls}`}>{st?.label}</span>
                </div>

                <Link href={`/schedule/${g.id}`} className="mt-3 block">
                  <Button variant="outline" size="sm" className="w-full">Boshqarish</Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <GroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        group={editTarget}
        courses={courses}
        teachers={teachers}
        branches={branches}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guruhni o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.name}</strong> guruhini o'chirasizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
