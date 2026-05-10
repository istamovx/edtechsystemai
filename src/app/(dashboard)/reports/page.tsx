import { Download, TrendingUp, TrendingDown, Users, BookOpen } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hisobotlar</h1>
          <p className="text-sm text-muted-foreground">O'qituvchi va o'quvchilar davomati, moliyaviy ko'rsatkichlar</p>
        </div>
        <button className="btn-primary"><Download size={14} /> PDF eksport</button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Faol o'quvchilar" value="247" change="+12" icon={<Users size={18} />} positive />
        <KpiCard label="O'qituvchilar" value="18" change="+1" icon={<BookOpen size={18} />} positive />
        <KpiCard label="Bu oy davomat" value="92.4%" change="+2.1%" icon={<TrendingUp size={18} />} positive />
        <KpiCard label="Kech kelganlar" value="34" change="-8" icon={<TrendingDown size={18} />} positive />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold">O'qituvchilar davomati (so'nggi 7 kun)</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { name: "Karim Sodiqov", subject: "Matematika", attendance: 100, lessons: 14 },
              { name: "Dilnoza Rahimova", subject: "Ingliz tili", attendance: 95, lessons: 19 },
              { name: "Sherzod Akbarov", subject: "Fizika", attendance: 88, lessons: 12 },
              { name: "Madina Yusupova", subject: "Kimyo", attendance: 100, lessons: 10 },
            ].map((t) => (
              <div key={t.name} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.lessons} dars / {t.attendance}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${t.attendance}%` }} />
                </div>
                <div className="text-xs text-muted-foreground">{t.subject}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">O'quvchilar reytingi (oy)</h3>
          <div className="mt-4 space-y-2 text-sm">
            {[
              { name: "Aliyev Doniyor", points: 950, group: "Matematika A1" },
              { name: "Nazarova Madina", points: 920, group: "Kimyo A1" },
              { name: "Karimova Sevinch", points: 880, group: "Fizika B2" },
              { name: "Yusupov Bekzod", points: 855, group: "Ingliz tili C1" },
            ].map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                  i === 0 ? "bg-yellow-100 text-yellow-700" :
                  i === 1 ? "bg-gray-100 text-gray-700" :
                  i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted"
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.group}</div>
                </div>
                <div className="font-semibold text-brand-600">{s.points} ball</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold">Turniket — kelish/ketish jurnali (bugun)</h3>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {[
            { name: "Aliyev Doniyor", time: "08:42", action: "IN", card: "RFID-A001" },
            { name: "Karimova Sevinch", time: "08:45", action: "IN", card: "RFID-A002" },
            { name: "Yusupov Bekzod", time: "09:12", action: "IN", card: "RFID-A003", late: true },
            { name: "Aliyev Doniyor", time: "12:30", action: "OUT", card: "RFID-A001" },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${e.action === "IN" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {e.action === "IN" ? "→" : "←"}
                </div>
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.card}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono">{e.time}</div>
                {e.late && <span className="badge bg-yellow-100 text-yellow-700 text-[10px]">Kech</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, change, icon, positive }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className={`mt-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-600"}`}>{change}</div>
    </div>
  );
}
