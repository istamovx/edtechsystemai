import { redirect } from "next/navigation";
import { TrendingUp, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant, canViewFinance } from "@/lib/session";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { formatUZS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const user = await requireTenant();
  if (!canViewFinance(user.role)) redirect("/dashboard");

  const tenantId = user.tenantId;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [payments, monthlyAgg, totalActiveStudents, pendingCount] = await Promise.all([
    prisma.payment.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { tenantId, status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.student.count({
      where: { tenantId, status: "ACTIVE" },
    }),
    prisma.payment.count({
      where: { tenantId, status: "PENDING" },
    }),
  ]);

  const monthlyTotal = monthlyAgg._sum.amount ? Number(monthlyAgg._sum.amount) : 0;
  const monthlyCount = monthlyAgg._count;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">To'lovlar</h1>
        <p className="text-sm text-muted-foreground">Tushum, qarzdorlik va to'lov tarixi</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Bu oy tushum"
          value={formatUZS(monthlyTotal)}
          icon={<TrendingUp size={18} />}
          color="green"
        />
        <StatCard
          label="Bu oy to'lovlar soni"
          value={monthlyCount.toString()}
          icon={<CheckCircle2 size={18} />}
          color="blue"
        />
        <StatCard
          label="Faol o'quvchilar"
          value={totalActiveStudents.toString()}
          icon={<Users size={18} />}
          color="purple"
        />
        <StatCard
          label="Kutilayotgan"
          value={pendingCount.toString()}
          icon={<AlertCircle size={18} />}
          color="amber"
        />
      </div>

      <PaymentsTable
        initialPayments={JSON.parse(JSON.stringify(payments))}
        isOwner={user.role === "TENANT_OWNER"}
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: "green" | "blue" | "purple" | "amber" }) {
  const colorClass = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  }[color];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${colorClass}`}>{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}
