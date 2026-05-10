import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { HomeworkBoard } from "@/components/homework/HomeworkBoard";

export const dynamic = "force-dynamic";

export default async function HomeworkPage() {
  const user = await requireTenant();
  const [homeworks, groups] = await Promise.all([
    prisma.homework.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        group: { select: { id: true, name: true, _count: { select: { members: true } } } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.group.findMany({
      where: { tenantId: user.tenantId, status: "ACTIVE" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Uy vazifalari</h1>
        <p className="text-sm text-muted-foreground">Guruhlar uchun vazifa berish va kuzatish</p>
      </div>
      <HomeworkBoard
        homeworks={JSON.parse(JSON.stringify(homeworks))}
        groups={JSON.parse(JSON.stringify(groups))}
      />
    </div>
  );
}
