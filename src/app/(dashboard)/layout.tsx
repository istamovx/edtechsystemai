import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // SUPER_ADMIN bo'lsa boshqa marshrut (kelajakda /admin)
  let enabledModules: string[] = ["dashboard", "users", "payments", "exams", "reports", "settings"];

  if (user.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { enabledModules: true },
    });
    if (tenant) enabledModules = tenant.enabledModules;
  }

  return (
    <div className="flex min-h-screen bg-[#e7e8ec] p-4">
      <Sidebar
        enabledModules={enabledModules}
        user={{ name: user.name ?? user.email ?? "Foydalanuvchi", role: user.role, avatar: null }}
      />
      <div className="ml-4 flex-1 overflow-hidden rounded-3xl bg-card">
        <Header user={{ name: user.name ?? user.email ?? "Foydalanuvchi", role: user.role, avatar: null }} />
        <main className="px-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
