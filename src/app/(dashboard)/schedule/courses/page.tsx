import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { CoursesTable } from "@/components/groups/CoursesTable";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await requireTenant();
  const courses = await prisma.course.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { groups: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dars jadvali</h1>
        <p className="text-sm text-muted-foreground">Kurslar — narxlar va davomiyligi</p>
      </div>
      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Guruhlar</Link>
        <Link href="/schedule/calendar" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kalendar</Link>
        <Link href="/schedule/courses" className="rounded-full px-4 py-2 text-sm font-medium bg-card shadow-sm">Kurslar</Link>
        <Link href="/schedule/rooms" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Xonalar</Link>
      </div>
      <CoursesTable courses={JSON.parse(JSON.stringify(courses))} />
    </div>
  );
}
