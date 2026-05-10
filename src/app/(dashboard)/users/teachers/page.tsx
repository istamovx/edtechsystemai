import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { TeachersTable } from "@/components/teachers/TeachersTable";
import { UsersTabs } from "@/components/users/UsersTabs";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const user = await requireTenant();

  const teachers = await prisma.teacher.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { groups: true, lessons: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">O'qituvchilar — fanlar, maosh, guruhlar</p>
      </div>
      <UsersTabs />
      <TeachersTable initialTeachers={JSON.parse(JSON.stringify(teachers))} total={teachers.length} />
    </div>
  );
}
