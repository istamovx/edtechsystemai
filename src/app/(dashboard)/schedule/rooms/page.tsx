import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { RoomsTable } from "@/components/groups/RoomsTable";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const user = await requireTenant();
  const [rooms, branches] = await Promise.all([
    prisma.room.findMany({
      where: { branch: { tenantId: user.tenantId } },
      orderBy: { name: "asc" },
      include: {
        branch: { select: { id: true, name: true } },
        _count: { select: { lessons: true } },
      },
    }),
    prisma.branch.findMany({ where: { tenantId: user.tenantId } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dars jadvali</h1>
        <p className="text-sm text-muted-foreground">Xonalar — filiallar bo'yicha</p>
      </div>
      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Guruhlar</Link>
        <Link href="/schedule/calendar" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kalendar</Link>
        <Link href="/schedule/courses" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kurslar</Link>
        <Link href="/schedule/rooms" className="rounded-full px-4 py-2 text-sm font-medium bg-card shadow-sm">Xonalar</Link>
      </div>
      <RoomsTable rooms={JSON.parse(JSON.stringify(rooms))} branches={JSON.parse(JSON.stringify(branches))} />
    </div>
  );
}
