import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, GraduationCap, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { GroupDetail } from "@/components/groups/GroupDetail";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();

  const [group, allStudents] = await Promise.all([
    prisma.group.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      include: {
        course: true,
        teacher: { select: { id: true, fullName: true } },
        branch: true,
        members: {
          include: {
            student: {
              select: {
                id: true, fullName: true, phone: true, status: true, studentNumber: true,
                _count: { select: { attendances: true, payments: true } },
              },
            },
          },
        },
        lessons: { orderBy: { startsAt: "desc" }, take: 10 },
      },
    }),
    prisma.student.findMany({
      where: { tenantId: user.tenantId, status: "ACTIVE" },
      select: { id: true, fullName: true, phone: true, studentNumber: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!group) notFound();

  return (
    <GroupDetail
      group={JSON.parse(JSON.stringify(group))}
      allStudents={JSON.parse(JSON.stringify(allStudents))}
    />
  );
}
