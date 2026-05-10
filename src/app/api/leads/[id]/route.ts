import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const existing = await prisma.lead.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const data: any = {};
  if (body.fullName) data.fullName = body.fullName;
  if (body.phone) data.phone = body.phone;
  if (body.source !== undefined) data.source = body.source || null;
  if (body.interestedIn !== undefined) data.interestedIn = body.interestedIn || null;
  if (body.note !== undefined) data.note = body.note || null;
  if (body.status) data.status = body.status;

  const updated = await prisma.lead.update({ where: { id: params.id }, data });

  // Agar ENROLLED bo'lsa avtomatik student yaratish
  if (body.status === "ENROLLED" && existing.status !== "ENROLLED") {
    await prisma.student.create({
      data: {
        tenantId: user.tenantId,
        fullName: updated.fullName,
        phone: updated.phone,
        status: "ACTIVE",
        notes: `CRMdan ko'chirilgan. Manba: ${updated.source ?? "—"}`,
      },
    });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const existing = await prisma.lead.findFirst({ where: { id: params.id, tenantId: user.tenantId } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
