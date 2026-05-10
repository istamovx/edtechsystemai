"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { ALL_MODULES, getEnabledModules } from "@/lib/modules";
import { cn, initials } from "@/lib/utils";

interface SidebarProps {
  enabledModules: string[];
  user: { name: string; role: string; avatar?: string | null };
  friends?: { name: string; label: string; avatar?: string | null }[];
}

export function Sidebar({ enabledModules, user, friends = [] }: SidebarProps) {
  const pathname = usePathname();
  const modules = getEnabledModules(enabledModules);
  const overview = modules.filter((m) => m.group === "core" && m.key !== "settings");
  const settings = modules.filter((m) => m.key === "settings");
  const extras = modules.filter((m) => m.group !== "core");

  return (
    <aside className="flex h-screen w-64 flex-col bg-card p-5">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
          <Sparkles size={16} />
        </div>
        <span className="text-base font-semibold">Edtech AI</span>
      </Link>

      <nav className="mt-8 flex-1 overflow-y-auto">
        <NavGroup title="Overview">
          {overview.map((m) => (
            <NavLink key={m.key} href={m.href} icon={<m.icon size={18} />} label={m.label} active={pathname.startsWith(m.href)} />
          ))}
        </NavGroup>

        {extras.length > 0 && (
          <NavGroup title="Modullar">
            {extras.map((m) => (
              <NavLink key={m.key} href={m.href} icon={<m.icon size={18} />} label={m.label} active={pathname.startsWith(m.href)} />
            ))}
          </NavGroup>
        )}

        {friends.length > 0 && (
          <NavGroup title="Friends">
            {friends.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-xl px-3 py-2">
                <Avatar name={f.name} src={f.avatar} size={32} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{f.label}</div>
                </div>
              </div>
            ))}
          </NavGroup>
        )}
      </nav>

      <div className="border-t border-border pt-3">
        <NavGroup title="Settings">
          {settings.map((m) => (
            <NavLink key={m.key} href={m.href} icon={<m.icon size={18} />} label={m.label} active={pathname.startsWith(m.href)} />
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            Chiqish
          </button>
        </NavGroup>
      </div>
    </aside>
  );
}

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-neutral-900 text-white" : "text-foreground/80 hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" />;
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-full bg-brand-100 text-xs font-medium text-brand-700"
    >
      {initials(name)}
    </div>
  );
}
