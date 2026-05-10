"use client";

import Link from "next/link";
import { Bell, Mail, Search, Settings, LogOut, ChevronDown, Building2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar } from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";

interface HeaderProps {
  user: { name: string; role: string; avatar?: string | null };
  tenant?: { name: string; id: string; ownerName?: string | null } | null;
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

export function Header({ user, tenant }: HeaderProps) {
  return (
    <header className="flex h-[72px] items-center gap-3 border-b border-border bg-card px-6 shrink-0">
      {/* Chap: Search */}
      <div className="relative flex-1 max-w-xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="O'quvchi, o'qituvchi yoki imtihon qidirish..."
        />
      </div>

      {/* O'ng: action tugmalar va user */}
      <div className="ml-auto flex items-center gap-2">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-muted hover:bg-muted/80 transition">
          <Mail size={16} />
        </button>
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-muted hover:bg-muted/80 transition">
          <Bell size={16} />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3 hover:bg-muted/40 transition">
              <Avatar name={user.name} src={user.avatar} size={32} />
              <div className="text-left">
                <div className="text-sm font-medium leading-tight">{user.name}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{ROLE_LABELS[user.role] ?? user.role}</div>
              </div>
              <ChevronDown size={14} className="text-muted-foreground ml-1" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
            {/* Markaz haqida */}
            {tenant && (
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{tenant.name}</div>
                    <div className="text-xs opacity-90 truncate">{tenant.ownerName ?? user.name}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-white/10 p-2 text-[10px] font-mono">
                  ID: {tenant.id}
                </div>
              </div>
            )}

            {/* User mini-info */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size={36} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{ROLE_LABELS[user.role] ?? user.role}</div>
                </div>
              </div>
            </div>

            {/* Aksiyalar */}
            <div className="p-1">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings size={14} /> Sozlamalar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => signOut({ callbackUrl: "/login" })}>
                <LogOut size={14} /> Chiqish
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
