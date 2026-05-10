import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { ParentsTable } from "@/components/parents/ParentsTable";
import { UsersTabs } from "@/components/users/UsersTabs";

export const dynamic = "force-dynamic";

export default async function ParentsPage() {
  const user = await requireTenant();

  const parents = await prisma.parent.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { children: { select: { id: true, fullName: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">Ota-onalar — Telegram orqali davomat va to'lov xabarlari</p>
      </div>
      <UsersTabs />
      <ParentsTable initialParents={JSON.parse(JSON.stringify(parents))} />
    </div>
  );
}
