import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { StaffTable } from "@/components/staff/StaffTable";
import { UsersTabs } from "@/components/users/UsersTabs";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) redirect("/dashboard");

  const staff = await prisma.user.findMany({
    where: {
      tenantId: user.tenantId,
      role: { in: ["ADMIN", "TENANT_OWNER"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      isActive: true, lastLoginAt: true, createdAt: true,
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">Xodimlar — tizim foydalanuvchilari (admin va markaz egasi)</p>
      </div>
      <UsersTabs />
      <StaffTable initialStaff={JSON.parse(JSON.stringify(staff))} currentUserId={user.id} />
    </div>
  );
}
