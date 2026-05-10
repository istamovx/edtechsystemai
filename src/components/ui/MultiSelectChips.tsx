"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelectChips({ options, value, onChange }: Props) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              selected
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            {selected && <Check size={12} />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
