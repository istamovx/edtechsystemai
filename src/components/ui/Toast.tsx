"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (t: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const remove = React.useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++counter;
      setToasts((cur) => [...cur, { id, ...t }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove]
  );

  const value: ToastContextValue = {
    show,
    success: (title, description) => show({ type: "success", title, description }),
    error: (title, description) => show({ type: "error", title, description }),
    info: (title, description) => show({ type: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border bg-card p-4 shadow-lg",
              t.type === "success" && "border-green-200",
              t.type === "error" && "border-red-200",
              t.type === "info" && "border-blue-200"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="mt-0.5 text-green-600" size={18} />}
            {t.type === "error" && <AlertCircle className="mt-0.5 text-red-600" size={18} />}
            {t.type === "info" && <Info className="mt-0.5 text-blue-600" size={18} />}
            <div className="flex-1">
              <div className="text-sm font-medium">{t.title}</div>
              {t.description && <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div>}
            </div>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
