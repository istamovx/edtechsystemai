"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, FileText, Sparkles, Upload, Check, X, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Select, Textarea, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { MathText } from "@/components/ui/MathText";

type Mode = "image" | "text";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: any[];
}

export function BulkImportDialog({ open, onOpenChange, subjects }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>("image");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<any[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const reset = () => {
    setImageData(null);
    setPasteText("");
    setParsed([]);
    setSkipped([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Rasm hajmi 10MB dan oshmasin");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (mode !== "image") return;
    const items = Array.from(e.clipboardData.items).filter((i) => i.type.startsWith("image/"));
    if (items.length === 0) return;
    e.preventDefault();
    const file = items[0].getAsFile();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const parseQuestions = async () => {
    if (!subjectId) {
      toast.error("Avval fanni tanlang");
      return;
    }
    if (mode === "image" && !imageData) {
      toast.error("Rasm yuklang");
      return;
    }
    if (mode === "text" && !pasteText.trim()) {
      toast.error("Matn kiriting");
      return;
    }

    setParsing(true);
    try {
      const res = await fetch("/api/questions/ai-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          payload: mode === "image" ? imageData : pasteText,
          subjectId,
          topicId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("AI xatolik", json.error);
        return;
      }
      setParsed(json.questions);
      setSkipped([]);
      toast.success(`${json.questions.length} ta savol topildi`, "Ko'rib chiqing va saqlang");
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setParsing(false);
    }
  };

  const toggleSkip = (idx: number) => {
    setSkipped((cur) => (cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    setParsed((cur) => cur.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qIdx: number, oIdx: number, field: string, value: any) => {
    setParsed((cur) =>
      cur.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o: any, oi: number) =>
                oi === oIdx ? { ...o, [field]: value } : { ...o, isCorrect: field === "isCorrect" && value ? false : o.isCorrect }
              ),
            }
          : q
      )
    );
  };

  const saveAll = async () => {
    const toSave = parsed.filter((_, i) => !skipped.includes(i));
    if (toSave.length === 0) {
      toast.error("Hech qanday savol tanlanmagan");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: toSave, subjectId, topicId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Saqlash xatosi", json.error);
        return;
      }
      toast.success(`${json.saved} ta savol saqlandi`, json.failed ? `${json.failed} ta o'tkazib yuborildi` : "");
      onOpenChange(false);
      reset();
      router.refresh();
    } catch (e: any) {
      toast.error("Tarmoq xatosi", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" /> AI yordamida savollar import
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fan tanlash */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Fan *</Label>
              <Select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(""); }}>
                <option value="">Tanlang</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Mavzu (ixtiyoriy)</Label>
              <Select value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={!selectedSubject}>
                <option value="">Tanlang</option>
                {selectedSubject?.topics?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Rejim tanlash */}
          <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
            <button
              type="button"
              onClick={() => { setMode("image"); reset(); }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "image" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <ImageIcon size={14} /> Rasm/Screenshot
            </button>
            <button
              type="button"
              onClick={() => { setMode("text"); reset(); }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "text" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <FileText size={14} /> Matn
            </button>
          </div>

          {/* Image mode */}
          {mode === "image" && parsed.length === 0 && (
            <div onPaste={handlePaste}>
              {imageData ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageData} alt="Yuklangan" className="rounded-xl border border-border max-h-80 mx-auto" />
                  <button
                    onClick={() => setImageData(null)}
                    className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border p-12 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition"
                >
                  <Upload size={36} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Rasmni yuklang yoki Ctrl+V bilan joylashtiring</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    DTM kitobi sahifasi, screenshot, telefondan rasm — hammasi bo'ladi
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Text mode */}
          {mode === "text" && parsed.length === 0 && (
            <div>
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                placeholder={`Misol matn:

1. If (2a+b)/(a+4b) = 3, then find the value of (a+b)/(a+2b) = ?
A) 5/9   B) 2/7   C) 10/7   D) 10/9

2. $\\sqrt{144}$ ifodaning qiymati nechaga teng?
A) 10   B) 12 (to'g'ri)   C) 14   D) 16

DTM kitobidan ko'chiring yoki o'zingiz yozing...`}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                💡 AI o'zingiz qaysi til/formatda yozsangiz tushunadi va o'zbekchaga moslashtiradi
              </p>
            </div>
          )}

          {/* Parse tugma */}
          {parsed.length === 0 && (
            <div className="flex justify-center">
              <Button
                onClick={parseQuestions}
                loading={parsing}
                disabled={!subjectId || (mode === "image" && !imageData) || (mode === "text" && !pasteText.trim())}
                size="lg"
              >
                <Sparkles size={16} /> AI bilan tahlil qilish
              </Button>
            </div>
          )}

          {/* Parsed natijalar */}
          {parsed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Topilgan savollar ({parsed.length - skipped.length} / {parsed.length})</h3>
                <button
                  onClick={() => { reset(); }}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Qaytadan tahlil qilish
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {parsed.map((q, idx) => {
                  const isSkipped = skipped.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 ${
                        isSkipped ? "border-border bg-muted/30 opacity-50" : "border-brand-200 bg-brand-50/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleSkip(idx)}
                          className={`grid h-6 w-6 place-items-center rounded border-2 shrink-0 ${
                            !isSkipped ? "border-brand-500 bg-brand-500 text-white" : "border-border"
                          }`}
                        >
                          {!isSkipped && <Check size={12} />}
                        </button>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="text-xs text-muted-foreground">Savol #{idx + 1}</div>
                          <div className="text-sm font-medium">
                            <MathText>{q.text}</MathText>
                          </div>
                          <div className="grid gap-1 sm:grid-cols-2 text-xs">
                            {q.options?.map((o: any, oi: number) => (
                              <label key={oi} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={o.isCorrect}
                                  onChange={() => updateOption(idx, oi, "isCorrect", true)}
                                  className="h-3 w-3"
                                />
                                <span className={o.isCorrect ? "text-green-600 font-medium" : ""}>
                                  {o.id}) <MathText>{o.text}</MathText>
                                </span>
                              </label>
                            ))}
                          </div>
                          {q.explanation && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">
                                Tushuntirish
                              </summary>
                              <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          {parsed.length > 0 && (
            <Button onClick={saveAll} loading={saving}>
              <Check size={14} /> Saqlash ({parsed.length - skipped.length} ta)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
