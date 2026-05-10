"use client";

import { useState } from "react";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";

type Tab = "students" | "teachers" | "mentors" | "staff" | "parents";

const TABS: { key: Tab; label: string }[] = [
  { key: "students", label: "O'quvchilar" },
  { key: "teachers", label: "O'qituvchilar" },
  { key: "mentors", label: "Mentorlar" },
  { key: "staff", label: "Xodimlar" },
  { key: "parents", label: "Ota-onalar" },
];

// DEMO ma'lumotlar
const DEMO_STUDENTS = [
  { name: "Aliyev Doniyor", phone: "+998 90 123 45 67", group: "Matematika A1", university: "TATU — Dasturiy injiniring", balance: -150000, cardId: "RFID-A001", status: "ACTIVE" },
  { name: "Karimova Sevinch", phone: "+998 91 234 56 78", group: "Fizika B2", university: "ToshDU — Fizika", balance: 0, cardId: "RFID-A002", status: "ACTIVE" },
  { name: "Yusupov Bekzod", phone: "+998 93 345 67 89", group: "Ingliz tili C1", university: "Westminster — Iqtisodiyot", balance: -200000, cardId: "RFID-A003", status: "ACTIVE" },
  { name: "Nazarova Madina", phone: "+998 94 456 78 90", group: "Kimyo A1", university: "TashFarmI", balance: 0, cardId: "RFID-A004", status: "PAUSED" },
];

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>("students");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
          <p className="text-sm text-muted-foreground">O'quvchi, o'qituvchi, mentor, xodim va ota-onalar</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Yangi qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="input pl-10" placeholder="F.I.SH yoki telefon bo'yicha qidirish..." />
        </div>
        <button className="btn-ghost border border-border">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Content */}
      {tab === "students" && (
        <div className="rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">F.I.SH</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Guruh</th>
                <th className="px-4 py-3 font-medium">Universitet / Fakultet</th>
                <th className="px-4 py-3 font-medium">Karta ID</th>
                <th className="px-4 py-3 font-medium">Balans</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DEMO_STUDENTS.map((s, i) => (
                <tr key={i} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={32} />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                  <td className="px-4 py-3"><span className="badge bg-blue-50 text-blue-700">{s.group}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.university}</td>
                  <td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{s.cardId}</code></td>
                  <td className={`px-4 py-3 font-medium ${s.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                    {new Intl.NumberFormat("uz-UZ").format(s.balance)} so'm
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {s.status === "ACTIVE" ? "Faol" : "To'xtatilgan"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-muted-foreground"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== "students" && (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground">Bu bo'lim ishlab chiqilmoqda. Tez orada qo'shiladi.</p>
        </div>
      )}

      {/* Turniket ma'lumoti */}
      <div className="card flex items-start gap-4 p-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">🎫</div>
        <div className="flex-1">
          <h3 className="font-semibold">Turniket integratsiyasi</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Har bir o'quvchiga RFID karta biriktirilgan. Turniketdan o'tganida davomat avtomatik belgilanadi va ota-onaga Telegram orqali xabar yuboriladi.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn-ghost border border-border text-sm">Webhook URL ni ko'rish</button>
            <button className="btn-ghost border border-border text-sm">So'nggi hodisalar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
