"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
  search?: string; // qo'shimcha qidiruv matni (telefon va h.k.)
}

interface Props {
  options: SearchableOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  error?: boolean;
  clearable?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Tanlang",
  searchPlaceholder = "Qidirish...",
  emptyText = "Hech narsa topilmadi",
  disabled,
  error,
  clearable,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => {
      return (
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.search?.toLowerCase().includes(q)
      );
    });
  }, [options, search]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Open bo'lganida search'ga focus
  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlightIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIdx]) {
      e.preventDefault();
      onChange(filtered[highlightIdx].value);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border bg-card px-4 text-sm outline-none transition cursor-pointer",
          "focus:ring-2 focus:ring-brand-100",
          error ? "border-red-400" : "border-border focus:border-brand-500",
          open ? "border-brand-500 ring-2 ring-brand-100" : "",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <span className={cn("truncate text-left", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && selected && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="grid h-5 w-5 place-items-center rounded hover:bg-muted text-muted-foreground"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={16} className={cn("text-muted-foreground transition", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setHighlightIdx(0); }}
                onKeyDown={handleKeyDown}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-brand-500"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              filtered.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHighlightIdx(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                    o.value === value && "bg-brand-50 text-brand-700",
                    i === highlightIdx && o.value !== value && "bg-muted",
                    "hover:bg-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{o.label}</div>
                    {o.description && (
                      <div className="truncate text-xs text-muted-foreground">{o.description}</div>
                    )}
                  </div>
                  {o.value === value && <Check size={14} className="text-brand-600 shrink-0" />}
                </button>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-border bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
              {filtered.length} ta natija · ↑↓ tanlash · Enter — tasdiqlash · Esc — yopish
            </div>
          )}
        </div>
      )}
    </div>
  );
}
