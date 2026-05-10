"use client";

import { Bell, Mail, Search } from "lucide-react";
import { Avatar } from "./Sidebar";

interface HeaderProps {
  user: { name: string; role: string; avatar?: string | null };
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  TENANT_OWNER: "Markaz egasi",
  ADMIN: "Administrator",
  TEACHER: "O'qituvchi",
  MENTOR: "Mentor",
  STUDENT: "O'quvchi",
  PARENT: "Ota-ona",
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-20 items-center gap-4 border-b border-border bg-card px-6 shrink-0">
      <div className="relative flex-1 max-w-2xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-full border border-border bg-background px-4 pl-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="O'quvchi, o'qituvchi yoki imtihon qidirish..."
        />
      </div>

      <button className="grid h-10 w-10 place-items-center rounded-full bg-muted hover:bg-muted/80">
        <Mail size={16} />
      </button>
      <button className="grid h-10 w-10 place-items-center rounded-full bg-muted hover:bg-muted/80 relative">
        <Bell size={16} />
        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="flex items-center gap-3 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-4">
        <Avatar name={user.name} src={user.avatar} size={32} />
        <div>
          <div className="text-sm font-medium leading-tight">{user.name}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">{ROLE_LABELS[user.role] ?? user.role}</div>
        </div>
      </div>
    </header>
  );
}
