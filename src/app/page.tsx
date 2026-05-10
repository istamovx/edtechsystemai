import Link from "next/link";
import { GraduationCap, Sparkles, Shield, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-semibold">Coursue</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn-ghost">Kirish</Link>
          <Link href="/register" className="btn-primary">Bepul boshlash</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
          <Sparkles size={12} /> AI bilan ishlovchi platforma
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
          O'quv markazingizni{" "}
          <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            sun'iy intellekt
          </span>{" "}
          bilan boshqaring
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Imtihon tahlili, davomat, to'lovlar, hisobotlar va telegram bot — barchasi bitta platformada.
          O'quvchilaringizga AI yordamida shaxsiylashtirilgan tavsiyalar bering.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register" className="btn-dark">14 kun bepul sinab ko'ring</Link>
          <Link href="#features" className="btn-ghost">Batafsil</Link>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature icon={<GraduationCap />} title="AI imtihon tahlili" desc="Claude AI o'quvchi natijalarini tahlil qilib, zaif mavzular va mos universitetlarni tavsiya qiladi." />
          <Feature icon={<Shield />} title="Turniket integratsiyasi" desc="RFID kartalar bilan davomat avtomatik. Ota-onalarga real-time Telegram xabari." />
          <Feature icon={<BarChart3 />} title="Modul tizimi" desc="Faqat kerakli modullarni yoqing — to'lovlar, CRM, sertifikatlar, gamifikatsiya va boshqalar." />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
