"use client";

import { useState } from "react";
import { ALL_MODULES } from "@/lib/modules";

export default function SettingsPage() {
  const [enabled, setEnabled] = useState<string[]>([
    "dashboard", "users", "payments", "exams", "reports", "schedule", "homework", "crm", "settings",
  ]);
  const [language, setLanguage] = useState("uz");
  const [theme, setTheme] = useState("light");

  const toggle = (key: string) => {
    setEnabled((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Sozlamalar</h1>
        <p className="text-sm text-muted-foreground">Modullar, til, mavzu va boshqa parametrlar</p>
      </div>

      {/* Modullar */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Modullarni boshqarish</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Faqat o'quv markazingizga kerakli modullarni yoqing. O'chirilgan modullar sidebar'da ko'rinmaydi.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {ALL_MODULES.filter((m) => m.key !== "settings" && m.key !== "dashboard").map((m) => {
            const isOn = enabled.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggle(m.key)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  isOn ? "border-brand-300 bg-brand-50/50" : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className={`mt-0.5 grid h-9 w-9 place-items-center rounded-xl ${isOn ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <m.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.label}</span>
                    {m.requiredPlan && m.requiredPlan !== "FREE" && (
                      <span className="badge bg-amber-100 text-amber-700 text-[10px]">{m.requiredPlan}+</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{m.description}</div>
                </div>
                <div className={`mt-1 h-5 w-9 rounded-full p-0.5 transition ${isOn ? "bg-brand-600" : "bg-muted"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition ${isOn ? "translate-x-4" : ""}`} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn-primary">Saqlash</button>
        </div>
      </section>

      {/* Til va mavzu */}
      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">Til</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tizim interfeysi tili</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { code: "uz", label: "O'zbek" },
              { code: "ru", label: "Русский" },
              { code: "en", label: "English" },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  language === l.code ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Mavzu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Yorug' yoki qorong'i ko'rinish</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { code: "light", label: "Light" },
              { code: "dark", label: "Dark" },
              { code: "system", label: "System" },
            ].map((t) => (
              <button
                key={t.code}
                onClick={() => setTheme(t.code)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  theme === t.code ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Telegram bot */}
      <section className="card p-5">
        <h2 className="font-semibold">Telegram bot integratsiyasi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O'quv markazingiz uchun shaxsiy Telegram bot. Test havolalari, login/parol, tasdiqlash kodlari va e'lonlar yuborish.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Bot token</label>
            <input className="input mt-1" placeholder="123456:AAH..." type="password" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Webhook URL (avtomatik)</label>
            <input className="input mt-1" value="https://coursue.uz/api/telegram/webhook" readOnly />
          </div>
        </div>
        <button className="btn-primary mt-4">Botni ulash</button>
      </section>
    </div>
  );
}
