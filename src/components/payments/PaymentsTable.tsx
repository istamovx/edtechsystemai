"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Download, MoreVertical, Edit2, Trash2, CreditCard } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/Dialog";
import { PaymentFormDialog } from "./PaymentFormDialog";
import { METHOD_LABELS, STATUS_LABELS } from "@/lib/validations/payment";
import { formatPhone, formatUZS } from "@/lib/utils";

interface Props {
  initialPayments: any[];
  isOwner: boolean;
}

export function PaymentsTable({ initialPayments, isOwner }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = initialPayments;
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (methodFilter) list = list.filter((p) => p.method === methodFilter);
    if (monthFilter) list = list.filter((p) => p.forMonth === monthFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.student?.fullName.toLowerCase().includes(q) ||
          p.student?.phone?.includes(q)
      );
    }
    return list;
  }, [initialPayments, search, statusFilter, methodFilter, monthFilter]);

  const totalAmount = filtered.reduce(
    (s, p) => s + (p.status === "PAID" ? Number(p.amount) : 0),
    0
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/payments/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("O'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const url = monthFilter ? `/api/payments/export?month=${monthFilter}` : "/api/payments/export";
    window.open(url, "_blank");
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
            placeholder="O'quvchi nomi yoki telefon..."
          />
        </div>

        <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-40 rounded-full">
          <option value="">Barcha oylar</option>
          {generateRecentMonths().map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </Select>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40 rounded-full">
          <option value="">Barcha holatlar</option>
          <option value="PAID">To'langan</option>
          <option value="PENDING">Kutilmoqda</option>
          <option value="FAILED">Xato</option>
          <option value="REFUNDED">Qaytarilgan</option>
        </Select>

        <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-36 rounded-full">
          <option value="">Barcha usul</option>
          {Object.entries(METHOD_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download size={14} /> Excel
          </Button>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Yangi to'lov
          </Button>
        </div>
      </div>

      {/* Filtered total */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Tanlangan filtr bo'yicha</div>
          <div className="mt-1 text-xl font-semibold">{formatUZS(totalAmount)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">To'lovlar soni</div>
          <div className="mt-1 text-xl font-semibold">{filtered.length}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <CreditCard size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hech qanday to'lov topilmadi</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-2xl">Sana</th>
                  <th className="px-4 py-3 font-medium">O'quvchi</th>
                  <th className="px-4 py-3 font-medium text-right">Summa</th>
                  <th className="px-4 py-3 font-medium">Usul</th>
                  <th className="px-4 py-3 font-medium">Oy</th>
                  <th className="px-4 py-3 font-medium">Holat</th>
                  <th className="px-4 py-3 rounded-tr-2xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const status = STATUS_LABELS[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.student?.fullName ?? "?"} size={32} />
                          <div>
                            <div className="font-medium">{p.student?.fullName}</div>
                            <div className="text-xs text-muted-foreground">{formatPhone(p.student?.phone)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatUZS(Number(p.amount))}</td>
                      <td className="px-4 py-3">{METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.forMonth ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status?.cls ?? "bg-muted"}`}>
                          {status?.label ?? p.status}
                        </span>
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
                            {isOwner && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem destructive onClick={() => setDeleteTarget(p)}>
                                  <Trash2 size={14} /> O'chirish
                                </DropdownMenuItem>
                              </>
                            )}
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

      <PaymentFormDialog open={formOpen} onOpenChange={setFormOpen} payment={editTarget} />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>To'lovni o'chirish</DialogTitle>
            <DialogDescription>
              {deleteTarget?.student?.fullName} ning <strong>{formatUZS(Number(deleteTarget?.amount ?? 0))}</strong> to'lovini o'chirasizmi?
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

function generateRecentMonths() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("uz-UZ", { year: "numeric", month: "long" });
    months.push({ value, label });
  }
  return months;
}
