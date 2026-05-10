import { Plus, Download, Search, Filter, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";
import { formatUZS } from "@/lib/utils";

const DEMO_PAYMENTS = [
  { name: "Aliyev Doniyor", phone: "+998 90 123 45 67", telegram: "@doniyor_a", university: "TATU", faculty: "Dasturiy injiniring", amount: 800000, debt: 150000, status: "DEBT" },
  { name: "Karimova Sevinch", phone: "+998 91 234 56 78", telegram: "@sevinch_k", university: "ToshDU", faculty: "Fizika", amount: 800000, debt: 0, status: "PAID" },
  { name: "Yusupov Bekzod", phone: "+998 93 345 67 89", telegram: "@bekzod_y", university: "Westminster", faculty: "Iqtisodiyot", amount: 1200000, debt: 200000, status: "DEBT" },
  { name: "Nazarova Madina", phone: "+998 94 456 78 90", telegram: "@madina_n", university: "TashFarmI", faculty: "Farmatsevtika", amount: 800000, debt: 0, status: "PAID" },
];

export default function PaymentsPage() {
  const totalDebt = DEMO_PAYMENTS.reduce((s, p) => s + p.debt, 0);
  const totalPaid = DEMO_PAYMENTS.reduce((s, p) => s + p.amount, 0);
  const debtCount = DEMO_PAYMENTS.filter((p) => p.debt > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">To'lov hisobotlari</h1>
          <p className="text-sm text-muted-foreground">O'quvchilar to'lovi va qarzdorlik</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost border border-border">
            <Download size={14} /> Excel'ga eksport
          </button>
          <button className="btn-primary">
            <Plus size={16} /> Yangi to'lov
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Jami tushum (oylik)" value={formatUZS(totalPaid)} change="+12%" positive />
        <StatCard label="Qarzdorlik summasi" value={formatUZS(totalDebt)} change="-5%" />
        <StatCard label="Qarzdor o'quvchilar" value={`${debtCount} ta`} change="2 yangi" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="input pl-10" placeholder="O'quvchi qidirish..." />
        </div>
        <button className="btn-ghost border border-border"><Filter size={14} /> Filter</button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-medium">O'quvchi F.I.SH</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Telegram</th>
              <th className="px-4 py-3 font-medium">Universitet / Fakultet</th>
              <th className="px-4 py-3 font-medium">To'lov</th>
              <th className="px-4 py-3 font-medium">Qarzdorlik</th>
              <th className="px-4 py-3 font-medium">Holat</th>
              <th className="px-4 py-3 font-medium text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DEMO_PAYMENTS.map((p, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size={32} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3 text-brand-600">{p.telegram}</td>
                <td className="px-4 py-3">
                  <div>{p.university}</div>
                  <div className="text-xs text-muted-foreground">{p.faculty}</div>
                </td>
                <td className="px-4 py-3 font-medium">{formatUZS(p.amount)}</td>
                <td className={`px-4 py-3 font-medium ${p.debt > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatUZS(p.debt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.status === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.status === "PAID" ? "To'langan" : "Qarzdor"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className="rounded-lg px-2 py-1 text-xs hover:bg-muted">Eslatma</button>
                    <button className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, positive }: { label: string; value: string; change: string; positive?: boolean }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className={`mt-2 text-xs font-medium ${positive ? "text-green-600" : "text-muted-foreground"}`}>{change}</div>
    </div>
  );
}
