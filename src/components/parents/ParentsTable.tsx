"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreVertical, Edit2, Trash2, Users } from "lucide-react";
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
import { ParentFormDialog } from "./ParentFormDialog";
import { formatPhone } from "@/lib/utils";

export function ParentsTable({ initialParents }: { initialParents: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return initialParents;
    const q = search.toLowerCase();
    return initialParents.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.telegramId?.includes(q)
    );
  }, [initialParents, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/parents/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("O'chirildi", deleteTarget.fullName);
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
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
            placeholder="F.I.SH, telefon, Telegram..."
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} / {initialParents.length}</span>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Yangi ota-ona
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search ? "Hech narsa topilmadi" : "Hali ota-onalar yo'q"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-2xl">F.I.SH</th>
                  <th className="px-4 py-3 font-medium">Telefon</th>
                  <th className="px-4 py-3 font-medium">Telegram</th>
                  <th className="px-4 py-3 font-medium">Farzandlari</th>
                  <th className="px-4 py-3 rounded-tr-2xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.fullName} size={32} />
                        <span className="font-medium">{p.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatPhone(p.phone)}</td>
                    <td className="px-4 py-3">
                      {p.telegramId ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.telegramId}</code>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.children?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {p.children.slice(0, 3).map((c: any) => (
                            <span key={c.id} className="badge bg-blue-50 text-blue-700 text-[10px]">{c.fullName}</span>
                          ))}
                          {p.children.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{p.children.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditTarget(p); setFormOpen(true); }}>
                            <Edit2 size={14} /> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onClick={() => setDeleteTarget(p)}>
                            <Trash2 size={14} /> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ParentFormDialog open={formOpen} onOpenChange={setFormOpen} parent={editTarget} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ota-onani o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.fullName}</strong> ni o'chirmoqchimisiz?
              {deleteTarget?.children?.length > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ {deleteTarget.children.length} ta o'quvchi bog'langan — avval bog'lashlarni olib tashlash kerak.
                </span>
              )}
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
