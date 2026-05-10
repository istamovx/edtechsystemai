"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "exams", label: "Imtihonlar", href: "/exams" },
  { key: "questions", label: "Savollar bazasi", href: "/exams/questions" },
  { key: "results", label: "Natijalar", href: "/exams/results" },
];

export function ExamsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
      {TABS.map((t) => {
        const active = pathname === t.href || (t.href !== "/exams" && pathname.startsWith(t.href));
        return (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition whitespace-nowrap",
              active ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
