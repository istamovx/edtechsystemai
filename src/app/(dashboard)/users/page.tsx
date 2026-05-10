import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { StudentsTable } from "@/components/students/StudentsTable";

const TABS = [
  { key: "students", label: "O'quvchilar", href: "/users" },
  { key: "teachers", label: "O'qituvchilar", href: "/users/teachers" },
  { key: "mentors", label: "Mentorlar", href: "/users/mentors" },
  { key: "staff", label: "Xodimlar", href: "/users/staff" },
  { key: "parents", label: "Ota-onalar", href: "/users/parents" },
];

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

      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              t.key === "students" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <StudentsTable initialStudents={JSON.parse(JSON.stringify(students))} total={total} />
    </div>
  );
}
