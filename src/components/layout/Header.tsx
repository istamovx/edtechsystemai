"use client";

import { Bell, Mail, Search } from "lucide-react";
import { Avatar } from "./Sidebar";

interface HeaderProps {
  user: { name: string; role: string; avatar?: string | null };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 px-6 py-4">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="input pl-10" placeholder="Kursni qidiring..." />
      </div>
      <button className="grid h-10 w-10 place-items-center rounded-full bg-card hover:bg-muted">
        <Mail size={16} />
      </button>
      <button className="grid h-10 w-10 place-items-center rounded-full bg-card hover:bg-muted">
        <Bell size={16} />
      </button>
      <div className="flex items-center gap-3 rounded-full bg-card px-3 py-1.5">
        <Avatar name={user.name} src={user.avatar} size={32} />
        <div className="pr-2 text-sm font-medium">{user.name}</div>
      </div>
    </header>
  );
}
