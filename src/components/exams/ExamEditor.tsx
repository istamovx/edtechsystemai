"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Search, Plus, X, GripVertical,
  Clock, Hash, BookOpen, Power, PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { DIFFICULTY_LABELS } from "@/lib/validations/exam";

interface Props {
  exam: any;
  allQuestions: any[];
  subjects: any[];
}

export function ExamEditor({ exam, allQuestions, subjects }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Tanlangan savollar (boshlang'ich — examdagi savollar)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    exam.questions.map((q: any) => q.questionId)
  );

  // Filtrlar
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const filtered = useMemo(() => {
    let list = allQuestions;
    if (subjectFilter) list = list.filter((q) => q.subjectId === subjectFilter);
    if (difficultyFilter) list = list.filter((q) => q.difficulty === parseInt(difficultyFilter));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((q) => q.text.toLowerCase().includes(s));
    }
    return list;
  }, [allQuestions, search, subjectFilter, difficultyFilter]);

  const selectedQuestions = useMemo(() => {
    return selectedIds
      .map((id) => allQuestions.find((q) => q.id === id))
      .filter(Boolean);
  }, [selectedIds, allQuestions]);

  const toggleQuestion = (id: string) => {
    setSelectedIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...selectedIds];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelectedIds(next);
  };

  const moveDown = (idx: number) => {
    if (idx === selectedIds.length - 1) return;
    const next = [...selectedIds];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSelectedIds(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: selectedIds }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Saqlash xatosi", json.error);
        return;
      }
      toast.success("Saqlandi", `${selectedIds.length} ta savol biriktirildi`);
      router.push(`/exams/${exam.id}`);
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async () => {
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !exam.isPublished }),
      });
      if (res.ok) {
        toast.success(exam.isPublished ? "Imtihon o'chirildi" : "Imtihon faollashtirildi");
        router.refresh();
      }
    } catch {}
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/exams" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{exam.title}</h1>
              <span className={`badge ${
                exam.isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
              }`}>
                {exam.isPublished ? "Faol" : "Loyiha"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              <Clock size={12} className="inline mr-1" /> {exam.durationMin} daqiqa
              {" · "}<Hash size={12} className="inline mr-1" /> {selectedIds.length} savol
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={togglePublished}>
            {exam.isPublished ? <><PowerOff size={14} /> O'chirish</> : <><Power size={14} /> Faollashtirish</>}
          </Button>
          <Button onClick={save} loading={saving}>
            <Save size={14} /> Saqlash
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Tanlangan savollar (chap) */}
        <section className="card p-5 max-h-[600px] overflow-y-auto sticky top-4 self-start">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Imtihondagi savollar ({selectedIds.length})</h3>
          </div>

          {selectedQuestions.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <BookOpen size={28} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                O'ng paneldan savollarni tanlang
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedQuestions.map((q: any, idx: number) => {
                const diff = DIFFICULTY_LABELS[q.difficulty];
                return (
                  <div key={q.id} className="rounded-xl border border-border p-3 bg-card">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === selectedQuestions.length - 1}
                          className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-700 text-xs font-semibold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-1">
                          <span className="badge bg-brand-50 text-brand-700 text-[10px]">{q.subject.name}</span>
                          {q.topic && <span className="badge bg-blue-50 text-blue-700 text-[10px]">{q.topic.name}</span>}
                          <span className={`badge text-[10px] ${diff?.cls}`}>{diff?.label}</span>
                        </div>
                        <p className="text-xs line-clamp-2">{q.text}</p>
                      </div>
                      <button
                        onClick={() => toggleQuestion(q.id)}
                        className="grid h-7 w-7 place-items-center rounded-full text-red-500 hover:bg-red-50 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Savol bazasi (o'ng) */}
        <section className="card p-5">
          <h3 className="font-semibold mb-3">Savol bazasi</h3>

          <div className="space-y-2 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                placeholder="Savol matni..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="">Barcha fanlar</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                <option value="">Barcha qiyinlik</option>
                <option value="1">⭐ Juda oson</option>
                <option value="2">⭐⭐ Oson</option>
                <option value="3">⭐⭐⭐ O'rta</option>
                <option value="4">⭐⭐⭐⭐ Qiyin</option>
                <option value="5">⭐⭐⭐⭐⭐ Juda qiyin</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {allQuestions.length === 0
                  ? "Hali savollar yo'q. Avval savol bazasiga qo'shing."
                  : "Filtrlarga mos savol topilmadi"}
              </p>
            ) : (
              filtered.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                const diff = DIFFICULTY_LABELS[q.difficulty];
                return (
                  <button
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    className={`w-full text-left rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/50"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`grid h-5 w-5 place-items-center rounded border-2 shrink-0 mt-0.5 ${
                        isSelected ? "border-brand-500 bg-brand-500 text-white" : "border-border"
                      }`}>
                        {isSelected && <Plus size={12} className="rotate-45" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-1">
                          <span className="badge bg-brand-50 text-brand-700 text-[10px]">{q.subject.name}</span>
                          {q.topic && <span className="badge bg-blue-50 text-blue-700 text-[10px]">{q.topic.name}</span>}
                          <span className={`badge text-[10px] ${diff?.cls}`}>{diff?.label}</span>
                        </div>
                        <p className="text-xs line-clamp-2">{q.text}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>Topildi: {filtered.length}</span>
            <Link href="/exams/questions" className="text-brand-600 hover:underline">
              + Yangi savol qo'shish
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
