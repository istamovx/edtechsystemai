import Link from "next/link";
import { GraduationCap, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { GroupsTable } from "@/components/groups/GroupsTable";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const user = await requireTenant();

  const [groups, courses, teachers, branches] = await Promise.all([
    prisma.group.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, name: true, price: true } },
        teacher: { select: { id: true, fullName: true } },
        branch: { select: { id: true, name: true } },
        _count: { select: { members: true, lessons: true } },
      },
    }),
    prisma.course.findMany({ where: { tenantId: user.tenantId } }),
    prisma.teacher.findMany({ where: { tenantId: user.tenantId, status: "ACTIVE" } }),
    prisma.branch.findMany({ where: { tenantId: user.tenantId } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dars jadvali</h1>
        <p className="text-sm text-muted-foreground">Guruhlar, dars vaqtlari va kurslar</p>
      </div>

      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-medium bg-card shadow-sm">Guruhlar</Link>
        <Link href="/schedule/calendar" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kalendar</Link>
        <Link href="/schedule/courses" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kurslar</Link>
        <Link href="/schedule/rooms" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Xonalar</Link>
      </div>

      <GroupsTable
        groups={JSON.parse(JSON.stringify(groups))}
        courses={JSON.parse(JSON.stringify(courses))}
        teachers={JSON.parse(JSON.stringify(teachers))}
        branches={JSON.parse(JSON.stringify(branches))}
      />
    </div>
  );
}
