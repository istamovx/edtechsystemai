import { ChevronRight, MoreVertical, Heart, Crosshair, Layers, Monitor } from "lucide-react";
import { Avatar } from "@/components/layout/Sidebar";

export default function DashboardPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white">
          <div className="text-xs font-medium uppercase tracking-wider opacity-80">Online Course</div>
          <h1 className="mt-2 max-w-md text-3xl font-semibold leading-tight">
            Bilimingizni mukammal kurslar bilan oshiring
          </h1>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/90 px-5 py-2.5 text-sm font-medium">
            Ro'yxatdan o'tish
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-black">
              <ChevronRight size={14} />
            </span>
          </button>
          <div className="absolute -right-10 top-6 text-7xl opacity-30">✦</div>
          <div className="absolute right-20 bottom-4 text-5xl opacity-20">✦</div>
        </section>

        {/* Subject quick access */}
        <section className="grid gap-4 sm:grid-cols-3">
          <SubjectCard icon={<Crosshair size={18} />} bg="bg-purple-100" color="text-purple-600" title="UI/UX Design" sub="2/8 watched" />
          <SubjectCard icon={<Layers size={18} />} bg="bg-pink-100" color="text-pink-600" title="Branding" sub="3/8 watched" />
          <SubjectCard icon={<Monitor size={18} />} bg="bg-blue-100" color="text-blue-600" title="Front End" sub="6/12 watched" />
        </section>

        {/* Continue Watching */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Davom ettirish</h2>
            <div className="flex gap-2">
              <button className="grid h-8 w-8 place-items-center rounded-full bg-muted">‹</button>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white">›</button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <CourseCard category="FRONT END" title="Professional Front-End Developer bo'lishga yo'l" mentor="Leonardo Samsul" />
            <CourseCard category="UI/UX DESIGN" title="Eng yaxshi UI/UX dizayn bilan UX optimallashtirish" mentor="Bayu Salto" />
            <CourseCard category="BRANDING" title="Kompaniya imijini yangilash va qayta tiklash" mentor="Padhang Satrio" />
          </div>
        </section>

        {/* Lessons table */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sizning darslaringiz</h2>
            <a className="text-sm text-brand-600">Barchasi</a>
          </div>
          <div className="rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Mentor</th>
                  <th className="px-4 py-3 font-medium">Tur</th>
                  <th className="px-4 py-3 font-medium">Tavsif</th>
                  <th className="px-4 py-3 font-medium text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name="Padhang Satrio" size={32} />
                      <div>
                        <div className="font-medium">Padhang Satrio</div>
                        <div className="text-xs text-muted-foreground">2/16/2024</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-purple-100 text-purple-700">UI/UX DESIGN</span>
                  </td>
                  <td className="px-4 py-3">UI/UX dizayn asoslarini tushunish</td>
                  <td className="px-4 py-3 text-right">
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right rail */}
      <aside className="space-y-5">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Statistika</h3>
            <button className="text-muted-foreground"><MoreVertical size={16} /></button>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-100">
                <Avatar name="Jason" size={84} />
              </div>
              <div className="absolute -right-2 top-0 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">32%</div>
            </div>
            <div className="mt-3 text-center">
              <div className="font-semibold">Xayrli tong, Jason 🔥</div>
              <div className="mt-1 text-xs text-muted-foreground">Maqsadingizga erishish uchun davom eting!</div>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-2">
            {[
              { label: "1-10 May", h: 50, active: false },
              { label: "11-20 May", h: 35, active: false },
              { label: "21-30 May", h: 75, active: true },
            ].map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
                <div className={`w-full rounded-t-lg ${b.active ? "bg-brand-600" : "bg-brand-100"}`} style={{ height: b.h }} />
                <div className="text-[10px] text-muted-foreground">{b.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sizning mentoringiz</h3>
            <button className="grid h-7 w-7 place-items-center rounded-full bg-muted">+</button>
          </div>
          <div className="mt-4 space-y-3">
            {["Padhang Satrio", "Zakir Horizontal", "Leonardo Samsul"].map((m) => (
              <div key={m} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m} size={36} />
                  <div>
                    <div className="text-sm font-medium">{m}</div>
                    <div className="text-xs text-muted-foreground">Mentor</div>
                  </div>
                </div>
                <button className="rounded-full border border-border px-3 py-1 text-xs">+ Follow</button>
              </div>
            ))}
            <button className="w-full rounded-xl bg-brand-50 py-2 text-sm text-brand-700">Barchasini ko'rish</button>
          </div>
        </section>
      </aside>
    </div>
  );
}

function SubjectCard({ icon, bg, color, title, sub }: any) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 px-4">
      <div className={`grid h-10 w-10 place-items-center rounded-full ${bg} ${color}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{sub}</div>
        <div className="font-medium">{title}</div>
      </div>
      <button className="text-muted-foreground"><MoreVertical size={16} /></button>
    </div>
  );
}

function CourseCard({ category, title, mentor }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-yellow-100 to-orange-100">
        <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80">
          <Heart size={14} />
        </button>
      </div>
      <div className="p-4">
        <span className="badge bg-purple-50 text-purple-700">{category}</span>
        <h4 className="mt-2 line-clamp-2 text-sm font-semibold">{title}</h4>
        <div className="mt-3 flex items-center gap-2">
          <Avatar name={mentor} size={28} />
          <div>
            <div className="text-xs font-medium">{mentor}</div>
            <div className="text-[10px] text-muted-foreground">Mentor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
