import Link from "next/link";
import { Plus, Sparkles, Upload, FileSpreadsheet, BookOpen, Calculator, Atom, Beaker, Languages, BookMarked } from "lucide-react";

const SUBJECTS = [
  { name: "Matematika", icon: Calculator, color: "text-blue-600", bg: "bg-blue-50", count: 245 },
  { name: "Fizika", icon: Atom, color: "text-purple-600", bg: "bg-purple-50", count: 178 },
  { name: "Kimyo", icon: Beaker, color: "text-green-600", bg: "bg-green-50", count: 156 },
  { name: "Biologiya", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", count: 134 },
  { name: "Ona-tili", icon: Languages, color: "text-rose-600", bg: "bg-rose-50", count: 198 },
  { name: "Adabiyot", icon: BookMarked, color: "text-amber-600", bg: "bg-amber-50", count: 167 },
  { name: "Tarix", icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50", count: 143 },
  { name: "Ingliz tili", icon: Languages, color: "text-cyan-600", bg: "bg-cyan-50", count: 212 },
  { name: "Rus tili", icon: Languages, color: "text-indigo-600", bg: "bg-indigo-50", count: 89 },
];

const EXAMS = [
  { title: "DTM bloki — Matematika + Fizika", subjects: ["Matematika", "Fizika"], questions: 60, duration: 180, attempts: 24 },
  { title: "Ingliz tili IELTS test", subjects: ["Ingliz tili"], questions: 40, duration: 90, attempts: 17 },
  { title: "Tibbiyot blok — Kimyo + Biologiya", subjects: ["Kimyo", "Biologiya"], questions: 50, duration: 120, attempts: 8 },
];

export default function ExamsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Imtihon moduli</h1>
          <p className="text-sm text-muted-foreground">AI tahlili bilan testlar va savol bazasi</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost border border-border"><Upload size={14} /> Word import</button>
          <button className="btn-ghost border border-border"><FileSpreadsheet size={14} /> Excel import</button>
          <Link href="/exams/new" className="btn-primary"><Plus size={16} /> Yangi imtihon</Link>
        </div>
      </div>

      {/* AI banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">AI yordamida imtihon tahlili</h2>
            <p className="mt-1 max-w-2xl text-sm opacity-90">
              Claude AI o'quvchining test natijasini tahlil qilib, zaif mavzularini aniqlaydi, xato javoblarni
              tushuntirib beradi va eng mos universitetlarni tavsiya qiladi. Bu xizmatni boshqa o'quv markazlariga
              ham bir martalik shaklda taqdim qilishingiz mumkin.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/exams/external" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-700">
                Tashqi xizmat sifatida sotish
              </Link>
              <Link href="/exams/ai-settings" className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                AI sozlamalari
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-6 text-9xl opacity-10">✦</div>
      </section>

      {/* Fanlar */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Fanlar bo'yicha savol bazasi</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SUBJECTS.map((s) => (
            <Link key={s.name} href={`/exams/subject/${encodeURIComponent(s.name)}`} className="card flex items-center gap-3 p-4 transition hover:shadow-md">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.count} ta savol</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Imtihonlar ro'yxati */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Yaratilgan imtihonlar</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {EXAMS.map((e, i) => (
            <div key={i} className="card p-5">
              <div className="flex flex-wrap gap-1">
                {e.subjects.map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
                ))}
              </div>
              <h3 className="mt-3 font-semibold">{e.title}</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold">{e.questions}</div>
                  <div className="text-muted-foreground">savol</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold">{e.duration}</div>
                  <div className="text-muted-foreground">daqiqa</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold">{e.attempts}</div>
                  <div className="text-muted-foreground">topshiriq</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full border border-border py-2 text-sm">Tahrirlash</button>
                <button className="flex-1 rounded-full bg-brand-600 py-2 text-sm text-white">Test boshlash</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formula muharriri preview */}
      <section className="card p-5">
        <h3 className="font-semibold">📐 Formula muharriri bilan savol yaratish</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Matematika, fizika, kimyo savollari uchun KaTeX/MathLive formula muharriri ishlatiladi.
          Misol: <code className="rounded bg-muted px-1.5 py-0.5">$\sqrt&#123;x^2 + y^2&#125;$</code> →
          √(x² + y²)
        </p>
        <Link href="/exams/new?type=math" className="mt-3 inline-block text-sm text-brand-600">
          Formula bilan savol yaratishni sinab ko'ring →
        </Link>
      </section>
    </div>
  );
}
