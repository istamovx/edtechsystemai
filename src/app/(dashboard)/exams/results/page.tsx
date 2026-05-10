import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { ExamsTabs } from "@/components/exams/ExamsTabs";
import { Avatar } from "@/components/layout/Sidebar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const user = await requireTenant();

  const attempts = await prisma.examAttempt.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { startedAt: "desc" },
    take: 100,
    include: {
      exam: { select: { title: true } },
      student: { select: { id: true, fullName: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Imtihonlar</h1>
        <p className="text-sm text-muted-foreground">Topshirilgan testlar va natijalar</p>
      </div>

      <ExamsTabs />

      {attempts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground">Hali imtihon topshiriqlari yo'q</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">O'quvchi</th>
                <th className="px-4 py-3 font-medium">Imtihon</th>
                <th className="px-4 py-3 font-medium">Sana</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3 font-medium text-right">Natija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attempts.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/users/students/${a.student.id}`} className="flex items-center gap-3 hover:text-brand-600">
                      <Avatar name={a.student.fullName} size={32} />
                      <span className="font-medium">{a.student.fullName}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{a.exam.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.startedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      a.status === "GRADED" ? "bg-green-100 text-green-700" :
                      a.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.percent !== null ? (
                      <div className="font-semibold">{a.percent.toFixed(1)}%</div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
