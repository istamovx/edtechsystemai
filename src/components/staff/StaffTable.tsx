"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreVertical, Edit2, Trash2, ShieldCheck, ShieldX, UserCog } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/Dialog";
import { StaffFormDialog } from "./StaffFormDialog";
import { formatPhone } from "@/lib/utils";

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  TENANT_OWNER: { label: "Markaz egasi", cls: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Admin", cls: "bg-blue-100 text-blue-700" },
};

export function StaffTable({ initialStaff, currentUserId }: { initialStaff: any[]; currentUserId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return initialStaff;
    const q = search.toLowerCase();
    return initialStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
    );
  }, [initialStaff, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("O'chirildi", deleteTarget.name);
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (s: any) => {
    try {
      const res = await fetch(`/api/staff/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) {
        const j = await res.json();
        toast.error("Xatolik", j.error);
        return;
      }
      toast.success(s.isActive ? "Bloklandi" : "Faollashtirildi", s.name);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    }
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
            placeholder="Ism, email, telefon..."
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} / {initialStaff.length}</span>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Yangi xodim
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCog size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{search ? "Hech narsa topilmadi" : "Hali xodimlar yo'q"}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-2xl">Ism</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Telefon</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Holat</th>
                  <th className="px-4 py-3 font-medium">So'nggi kirish</th>
                  <th className="px-4 py-3 rounded-tr-2xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => {
                  const role = ROLE_LABELS[s.role];
                  const isMe = s.id === currentUserId;
                  return (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} size={32} />
                          <span className="font-medium">
                            {s.name}
                            {isMe && <span className="ml-2 text-xs text-muted-foreground">(siz)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.email ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatPhone(s.phone)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${role?.cls ?? "bg-muted"}`}>
                          {role?.label ?? s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <ShieldCheck size={12} /> Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600">
                            <ShieldX size={12} /> Bloklangan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("uz-UZ") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditTarget(s); setFormOpen(true); }}>
                              <Edit2 size={14} /> Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(s)} disabled={isMe}>
                              {s.isActive ? <><ShieldX size={14} /> Bloklash</> : <><ShieldCheck size={14} /> Faollashtirish</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onClick={() => setDeleteTarget(s)} disabled={isMe}>
                              <Trash2 size={14} /> O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} staffMember={editTarget} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xodimni o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.name}</strong> ni o'chirmoqchimisiz? U boshqa platformaga kira olmaydi.
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
