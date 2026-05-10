"use client";

import { useEffect, useRef } from "react";

// Inline va block matematika formulalarini KaTeX bilan render qiladi
// Format: oddiy matn + $...$ inline formulalar
export function MathText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const renderKatex = async () => {
      const katex = (await import("katex")).default;
      // CSS yuklash
      if (typeof document !== "undefined" && !document.getElementById("katex-css")) {
        const link = document.createElement("link");
        link.id = "katex-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css";
        document.head.appendChild(link);
      }

      if (!ref.current) return;
      const text = children;
      const parts = text.split(/(\$[^$]+\$)/g);
      ref.current.innerHTML = "";
      parts.forEach((part) => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const formula = part.slice(1, -1);
          const span = document.createElement("span");
          try {
            katex.render(formula, span, { throwOnError: false, output: "html" });
          } catch {
            span.textContent = part;
          }
          ref.current!.appendChild(span);
        } else if (part) {
          const text = document.createTextNode(part);
          ref.current!.appendChild(text);
        }
      });
    };

    renderKatex().catch(() => {
      if (ref.current) ref.current.textContent = children;
    });
  }, [children]);

  return <span ref={ref} className={className}>{children}</span>;
}
