import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { StudentsTable } from "@/components/students/StudentsTable";
import { UsersTabs } from "@/components/users/UsersTabs";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await requireTenant();

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        parent: { select: { id: true, fullName: true, phone: true } },
        branch: { select: { id: true, name: true } },
        _count: { select: { payments: true, attendances: true, examAttempts: true } },
      },
    }),
    prisma.student.count({ where: { tenantId: user.tenantId } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <p className="text-sm text-muted-foreground">O'quvchi, o'qituvchi, mentor, xodim va ota-onalar</p>
      </div>

      <UsersTabs />

      <StudentsTable initialStudents={JSON.parse(JSON.stringify(students))} total={total} />
    </div>
  );
}
