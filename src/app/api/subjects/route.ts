import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export async function GET() {
  const user = await requireTenant();
  const subjects = await prisma.subject.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: "asc" },
    include: {
      topics: { orderBy: { name: "asc" } },
      _count: { select: { questions: true } },
    },
  });
  return NextResponse.json({ data: subjects });
}
