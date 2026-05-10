import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { CRMBoard } from "@/components/crm/CRMBoard";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const user = await requireTenant();
  const leads = await prisma.lead.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">CRM — Lidlar</h1>
        <p className="text-sm text-muted-foreground">Yangi qiziquvchilar va sotuv voronkasi</p>
      </div>
      <CRMBoard initialLeads={JSON.parse(JSON.stringify(leads))} />
    </div>
  );
}
