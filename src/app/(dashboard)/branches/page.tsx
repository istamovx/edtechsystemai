import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { BranchesTable } from "@/components/branches/BranchesTable";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const user = await requireTenant();
  const branches = await prisma.branch.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { students: true, groups: true, rooms: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Filiallar</h1>
        <p className="text-sm text-muted-foreground">O'quv markazi filiallari va xonalari</p>
      </div>
      <BranchesTable branches={JSON.parse(JSON.stringify(branches))} />
    </div>
  );
}
