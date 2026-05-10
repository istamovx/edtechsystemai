import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export async function GET() {
  const user = await requireTenant();
  const leads = await prisma.lead.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: leads });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  const { fullName, phone, source, interestedIn, note } = await req.json();
  if (!fullName || !phone) return NextResponse.json({ error: "F.I.SH va telefon kerak" }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      tenantId: user.tenantId,
      fullName, phone,
      source: source || undefined,
      interestedIn: interestedIn || undefined,
      note: note || undefined,
    },
  });
  return NextResponse.json({ data: lead }, { status: 201 });
}
