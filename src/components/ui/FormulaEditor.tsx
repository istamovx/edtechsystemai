"use client";

import { useEffect, useRef, useState } from "react";
import { Sigma, Check, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

// MathLive global types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": any;
    }
  }
  interface Window {
    MathfieldElement?: any;
  }
}

// Tez-tez ishlatiladigan formulalar (klikda kiritish)
const QUICK_TEMPLATES = [
  { label: "Kasr", latex: "\\frac{a}{b}" },
  { label: "Kvadrat ildiz", latex: "\\sqrt{x}" },
  { label: "n-darajali ildiz", latex: "\\sqrt[n]{x}" },
  { label: "Daraja", latex: "x^{n}" },
  { label: "Indeks", latex: "x_{i}" },
  { label: "Yig'indi", latex: "\\sum_{i=1}^{n} x_i" },
  { label: "Integral", latex: "\\int_{a}^{b} f(x)\\,dx" },
  { label: "Limit", latex: "\\lim_{x \\to \\infty} f(x)" },
  { label: "Logarifm", latex: "\\log_{b}(x)" },
  { label: "Sinus", latex: "\\sin(\\alpha)" },
  { label: "Kosinus", latex: "\\cos(\\alpha)" },
  { label: "π", latex: "\\pi" },
  { label: "∞", latex: "\\infty" },
  { label: "Δ", latex: "\\Delta" },
  { label: "α β γ", latex: "\\alpha\\beta\\gamma" },
  { label: "≠", latex: "\\neq" },
  { label: "≤", latex: "\\leq" },
  { label: "≥", latex: "\\geq" },
  { label: "→", latex: "\\rightarrow" },
  { label: "Vektor", latex: "\\vec{v}" },
];

const PRESET_FORMULAS = [
  { name: "Kvadrat tenglama yechimi", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
  { name: "Pifagor teoremasi", latex: "a^2 + b^2 = c^2" },
  { name: "Doira yuzasi", latex: "S = \\pi r^2" },
  { name: "Aylana uzunligi", latex: "L = 2\\pi r" },
  { name: "Sferaning hajmi", latex: "V = \\frac{4}{3}\\pi r^3" },
  { name: "Nyutonning II qonuni", latex: "F = ma" },
  { name: "Kinetik energiya", latex: "E_k = \\frac{1}{2}mv^2" },
  { name: "Ohm qonuni", latex: "U = IR" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialLatex?: string;
  onInsert: (latex: string) => void;
}

export function FormulaEditor({ open, onOpenChange, initialLatex = "", onInsert }: Props) {
  const fieldRef = useRef<any>(null);
  const [latex, setLatex] = useState(initialLatex);
  const [loaded, setLoaded] = useState(false);

  // MathLive ni yuklash
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.MathfieldElement) {
      setLoaded(true);
      return;
    }
    import("mathlive")
      .then(() => setLoaded(true))
      .catch((e) => console.error("MathLive yuklanmadi:", e));
  }, []);

  useEffect(() => {
    if (!loaded || !fieldRef.current || !open) return;
    fieldRef.current.value = initialLatex;
    setLatex(initialLatex);
    fieldRef.current.addEventListener("input", () => {
      setLatex(fieldRef.current.value);
    });
  }, [loaded, open, initialLatex]);

  const insertTemplate = (tpl: string) => {
    if (fieldRef.current) {
      fieldRef.current.executeCommand(["insert", tpl]);
      fieldRef.current.focus();
    }
  };

  const usePreset = (formula: string) => {
    if (fieldRef.current) {
      fieldRef.current.value = formula;
      setLatex(formula);
      fieldRef.current.focus();
    }
  };

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(`$${latex}$`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sigma size={18} /> Formula konstruktori
          </DialogTitle>
        </DialogHeader>

        {!loaded ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Formula muharriri yuklanmoqda...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Math editor */}
            <div className="rounded-xl border-2 border-border focus-within:border-brand-500 transition p-4 bg-white">
              {/* @ts-ignore */}
              <math-field
                ref={fieldRef}
                style={{
                  fontSize: "20px",
                  width: "100%",
                  minHeight: "60px",
                  border: "none",
                  outline: "none",
                }}
                virtual-keyboard-mode="manual"
                math-virtual-keyboard-policy="manual"
              >
                {initialLatex}
              {/* @ts-ignore */}
              </math-field>
            </div>

            {/* Tez kiritish tugmalari */}
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Tez kiritish:</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => insertTemplate(t.latex)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted transition"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tayyor formulalar */}
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Tayyor formulalar:</div>
              <div className="grid gap-1 sm:grid-cols-2 max-h-32 overflow-y-auto">
                {PRESET_FORMULAS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => usePreset(p.latex)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-left text-xs hover:bg-brand-50 hover:border-brand-300 transition"
                  >
                    <div className="font-medium">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* LaTeX preview */}
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground mb-1">LaTeX kod:</div>
              <code className="block text-sm break-all font-mono">${latex || "..."}$</code>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!latex.trim()}>
            <Check size={14} /> Savolga qo'shish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Fan slug bo'yicha formula muharriri kerakligini aniqlash
export const MATH_SUBJECT_SLUGS = [
  "matematika",
  "fizika",
  "kimyo",
  "biologiya",
  "algebra",
];

export function isMathSubject(subjectSlug?: string, subjectName?: string): boolean {
  if (subjectSlug && MATH_SUBJECT_SLUGS.includes(subjectSlug.toLowerCase())) return true;
  if (subjectName) {
    const lower = subjectName.toLowerCase();
    return ["matematika", "fizika", "kimyo", "biologiya", "algebra"].some((s) => lower.includes(s));
  }
  return false;
}
