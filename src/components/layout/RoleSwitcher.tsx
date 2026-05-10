"use client";

import { useState, useEffect } from "react";
import {
  Shield, ChevronDown, Check, Crown, ShieldCheck, GraduationCap,
  UserCheck, BookOpen, Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";

const ROLES = [
  { value: "TENANT_OWNER", label: "Markaz egasi", Icon: Crown, desc: "To'liq boshqaruv", color: "text-amber-600" },
  { value: "ADMIN", label: "Administrator", Icon: ShieldCheck, desc: "Kundalik amallar", color: "text-blue-600" },
  { value: "TEACHER", label: "O'qituvchi", Icon: GraduationCap, desc: "Darslar va guruhlar", color: "text-purple-600" },
  { value: "MENTOR", label: "Mentor", Icon: UserCheck, desc: "Kuratorlik", color: "text-pink-600" },
  { value: "STUDENT", label: "O'quvchi", Icon: BookOpen, desc: "Imtihonlar va vazifalar", color: "text-green-600" },
  { value: "PARENT", label: "Ota-ona", Icon: Users, desc: "Farzand kuzatuvi", color: "text-rose-600" },
];

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [activeRole, setActiveRole] = useState(currentRole);

  useEffect(() => {
    const fromCookie = getCookie("__demo_role__");
    if (fromCookie && ROLES.some((r) => r.value === fromCookie)) {
      setActiveRole(fromCookie);
    } else {
      setActiveRole(currentRole);
    }
  }, [currentRole]);

  const switchRole = (role: string) => {
    if (role === activeRole) return;
    setActiveRole(role);
    // Cookie va localStorage'ga yozish
    document.cookie = `__demo_role__=${role}; path=/; max-age=86400; SameSite=Lax`;
    if (typeof window !== "undefined") {
      localStorage.setItem("__demo_role__", role);
      // Sahifani to'liq qayta yuklash (cookie yangi rolda o'qiladi)
      window.location.href = "/dashboard";
    }
  };

  const current = ROLES.find((r) => r.value === activeRole) ?? ROLES[0];
  const CurrentIcon = current.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition">
          <CurrentIcon size={14} className={current.color} />
          <span>{current.label}</span>
          <ChevronDown size={12} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 p-3">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <Shield size={12} />
            <span className="font-bold">DEMO REJIMI</span>
          </div>
          <p className="mt-1 text-[10px] text-amber-700 leading-relaxed">
            Rol o'zgartirsangiz interfeys yangi rolga moslashadi. Loyiha tugagandan so'ng login/parol bilan ishlaydi.
          </p>
        </div>
        <div className="p-1">
          {ROLES.map((r) => {
            const RoleIcon = r.Icon;
            return (
              <DropdownMenuItem
                key={r.value}
                onSelect={() => switchRole(r.value)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={`grid h-9 w-9 place-items-center rounded-lg bg-muted ${r.color}`}>
                  <RoleIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                </div>
                {activeRole === r.value && <Check size={14} className="text-brand-600" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
