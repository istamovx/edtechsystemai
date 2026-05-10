import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getModulesForRole } from "@/lib/role-modules";

const VALID_DEMO_ROLES = [
  "TENANT_OWNER", "ADMIN", "TEACHER", "MENTOR", "STUDENT", "PARENT", "SUPER_ADMIN",
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Cookie'dan demo rolni o'qish (test rejimi)
  const demoRoleCookie = cookies().get("__demo_role__")?.value;
  const effectiveRole = demoRoleCookie && VALID_DEMO_ROLES.includes(demoRoleCookie)
    ? demoRoleCookie
    : user.role;

  let tenantEnabled: string[] = [
    "dashboard", "users", "payments", "exams", "reports",
    "schedule", "homework", "crm", "branches", "settings",
  ];
  let tenant: { name: string; id: string; ownerName?: string | null } | null = null;

  if (user.tenantId) {
    const t = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        id: true, name: true, enabledModules: true,
        users: { where: { role: "TENANT_OWNER" }, select: { name: true }, take: 1 },
      },
    });
    if (t) {
      tenantEnabled = t.enabledModules;
      tenant = { id: t.id, name: t.name, ownerName: t.users[0]?.name ?? null };
    }
  }

  // Effective role uchun mavjud modullar
  const visibleModules = getModulesForRole(effectiveRole, tenantEnabled);
  const enabledKeys = visibleModules.map((m) => m.key);

  const userInfo = {
    name: user.name ?? user.email ?? "Foydalanuvchi",
    role: effectiveRole, // demo rol ko'rsatiladi
    avatar: null,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar enabledModules={enabledKeys} user={userInfo} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header user={userInfo} tenant={tenant} />
        <main className="flex-1 overflow-x-hidden bg-[#f5f5f7] p-6">{children}</main>
      </div>
    </div>
  );
}
