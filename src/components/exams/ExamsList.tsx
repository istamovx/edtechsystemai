"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, Users, Sparkles, Eye, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ExamsList({ exams, subjects }: { exams: any[]; subjects: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  const handleQuickCreate = async () => {
    setCreating(true);
    try {
      const title = prompt("Imtihon nomi:", "Yangi imtihon");
      if (!title) {
        setCreating(false);
        return;
      }
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, durationMin: 60, totalScore: 100, isPublished: false }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Yaratib bo'lmadi", json.error);
        return;
      }
      toast.success("Imtihon yaratildi", title);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Imtihonlar ro'yxati</h2>
          <p className="text-sm text-muted-foreground">Yaratilgan testlar va ularning natijalari</p>
        </div>
        <Button onClick={handleQuickCreate} loading={creating}>
          <Plus size={16} /> Yangi imtihon
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Hali imtihon yaratilmagan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Avval "Savollar bazasi" tabiga o'tib savollar qo'shing, keyin imtihon yarating
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <div key={e.id} className="card p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold flex-1 line-clamp-2">{e.title}</h3>
                <span className={`badge text-[10px] ${
                  e.isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                }`}>
                  {e.isPublished ? "Faol" : "Loyiha"}
                </span>
              </div>

              {e.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{e.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <BookOpen size={12} /> {e._count?.questions ?? 0}
                  </div>
                  <div className="text-muted-foreground">savol</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <Clock size={12} /> {e.durationMin}
                  </div>
                  <div className="text-muted-foreground">daq</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <Users size={12} /> {e._count?.attempts ?? 0}
                  </div>
                  <div className="text-muted-foreground">topshiriq</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/exams/${e.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye size={14} /> Ko'rish
                  </Button>
                </Link>
                <Link href={`/exams/${e.id}/edit`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Edit2 size={14} /> Tahrirlash
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">AI tahlil yoqilgan</h3>
            <p className="mt-1 text-sm opacity-90">
              O'quvchi imtihon topshirgach, Claude AI avtomatik tahlil qiladi:
              zaif mavzular, mos universitetlar, xato javoblar tushuntirishi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
