import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { TeachersTable } from "@/components/teachers/TeachersTable";
import { UsersTabs } from "@/components/users/UsersTabs";

export const dynamic = "force-dynamic";

export default async function MentorsPage() {
  const user = await requireTenant();

  const mentors = await prisma.teacher.findMany({
    where: { tenantId: user.tenantId, isMentor: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { groups: true, lessons: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">Mentorlar — kuratorlik vazifasini bajaruvchilar</p>
      </div>
      <UsersTabs />
      <TeachersTable
        initialTeachers={JSON.parse(JSON.stringify(mentors))}
        total={mentors.length}
        forceMentor
      />
    </div>
  );
}
