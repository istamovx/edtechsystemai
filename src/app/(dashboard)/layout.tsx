import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  let enabledModules: string[] = ["dashboard", "users", "payments", "exams", "reports", "settings"];

  if (user.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { enabledModules: true },
    });
    if (tenant) enabledModules = tenant.enabledModules;
  }

  const userInfo = {
    name: user.name ?? user.email ?? "Foydalanuvchi",
    role: user.role,
    avatar: null,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar enabledModules={enabledModules} user={userInfo} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header user={userInfo} />
        <main className="flex-1 overflow-x-hidden bg-[#f5f5f7] p-6">{children}</main>
      </div>
    </div>
  );
}
