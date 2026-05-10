"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "students", label: "O'quvchilar", href: "/users" },
  { key: "teachers", label: "O'qituvchilar", href: "/users/teachers" },
  { key: "mentors", label: "Mentorlar", href: "/users/mentors" },
  { key: "staff", label: "Xodimlar", href: "/users/staff" },
  { key: "parents", label: "Ota-onalar", href: "/users/parents" },
];

export function UsersTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 rounded-full bg-muted p-1 w-fit overflow-x-auto">
      {TABS.map((t) => {
        const active = pathname === t.href || (t.href === "/users" && pathname === "/users");
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
