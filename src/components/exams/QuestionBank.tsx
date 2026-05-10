"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreVertical, Edit2, Trash2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/Dialog";
import { QuestionFormDialog } from "./QuestionFormDialog";
import { BulkImportDialog } from "./BulkImportDialog";
import { MathText } from "@/components/ui/MathText";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/validations/exam";

export function QuestionBank({ subjects, initialQuestions }: { subjects: any[]; initialQuestions: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = initialQuestions;
    if (subjectFilter) list = list.filter((q) => q.subjectId === subjectFilter);
    if (difficultyFilter) list = list.filter((q) => q.difficulty === parseInt(difficultyFilter));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((q) => q.text.toLowerCase().includes(s));
    }
    return list;
  }, [initialQuestions, search, subjectFilter, difficultyFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/questions/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi", json.error);
        return;
      }
      toast.success("Savol o'chirildi");
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setDeleting(false);
    }
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
            placeholder="Savol matni bo'yicha qidirish..."
          />
        </div>

        <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-44 rounded-full">
          <option value="">Barcha fanlar</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>

        <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="w-36 rounded-full">
          <option value="">Barcha qiyinlik</option>
          <option value="1">⭐ Juda oson</option>
          <option value="2">⭐⭐ Oson</option>
          <option value="3">⭐⭐⭐ O'rta</option>
          <option value="4">⭐⭐⭐⭐ Qiyin</option>
          <option value="5">⭐⭐⭐⭐⭐ Juda qiyin</option>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} / {initialQuestions.length}</span>
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <Sparkles size={14} /> AI import
          </Button>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus size={16} /> Yangi savol
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search || subjectFilter || difficultyFilter ? "Hech narsa topilmadi" : "Hali savollar yo'q"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((q) => {
            const diff = DIFFICULTY_LABELS[q.difficulty];
            return (
              <div key={q.id} className="card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="badge bg-brand-50 text-brand-700">
                        {q.subject?.name}
                      </span>
                      {q.topic && (
                        <span className="badge bg-blue-50 text-blue-700">{q.topic.name}</span>
                      )}
                      <span className={`badge ${diff?.cls}`}>{diff?.label}</span>
                      <span className="badge bg-muted text-muted-foreground">
                        {QUESTION_TYPE_LABELS[q.type]}
                      </span>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">
                      <MathText>{q.text}</MathText>
                    </p>
                    {q.options && Array.isArray(q.options) && (
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        {q.options.slice(0, 4).map((o: any) => (
                          <div key={o.id} className={o.isCorrect ? "text-green-600 font-medium" : ""}>
                            {o.id}) <MathText>{o.text}</MathText> {o.isCorrect && "✓"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditTarget(q); setFormOpen(true); }}>
                        <Edit2 size={14} /> Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive onClick={() => setDeleteTarget(q)}>
                        <Trash2 size={14} /> O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <QuestionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        question={editTarget}
        subjects={subjects}
        preselectedSubjectId={subjectFilter || undefined}
      />

      <BulkImportDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        subjects={subjects}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Savolni o'chirish</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.text?.slice(0, 80)}..." savolini o'chirasizmi?
              Bu savoldan foydalangan imtihonlardan ham olib tashlanadi.
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
