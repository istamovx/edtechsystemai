"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";

const ROLES = [
  { value: "TENANT_OWNER", label: "Markaz egasi", icon: "👑", desc: "To'liq boshqaruv" },
  { value: "ADMIN", label: "Administrator", icon: "🛡", desc: "Kundalik amallar" },
  { value: "TEACHER", label: "O'qituvchi", icon: "👨‍🏫", desc: "Darslar va guruhlar" },
  { value: "MENTOR", label: "Mentor", icon: "🎓", desc: "Kuratorlik" },
  { value: "STUDENT", label: "O'quvchi", icon: "👨‍🎓", desc: "Imtihonlar va vazifalar" },
  { value: "PARENT", label: "Ota-ona", icon: "👨‍👩‍👧", desc: "Farzand kuzatuvi" },
];

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const router = useRouter();
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
    setActiveRole(role);
    document.cookie = `__demo_role__=${role}; path=/; max-age=86400; SameSite=Lax`;
    if (typeof window !== "undefined") {
      localStorage.setItem("__demo_role__", role);
    }
    // Sahifani serverdan qayta yuklash
    router.refresh();
    // Va dashboard'ga yo'naltirish (rolga mos bo'lmagan sahifada bo'lsa)
    router.push("/dashboard");
  };

  const current = ROLES.find((r) => r.value === activeRole) ?? ROLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition">
          <span className="text-base">{current.icon}</span>
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
            Rol o'zgartiring va interfeys qanday o'zgarishini ko'ring. Loyiha tugagandan so'ng login/parol bilan ishlaydi.
          </p>
        </div>
        <div className="p-1">
          {ROLES.map((r) => (
            <DropdownMenuItem
              key={r.value}
              onSelect={() => switchRole(r.value)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-[10px] text-muted-foreground">{r.desc}</div>
              </div>
              {activeRole === r.value && <Check size={14} className="text-brand-600" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
