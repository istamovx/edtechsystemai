import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";
import { staffUpdateSchema } from "@/lib/validations/staff";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (user.role !== "TENANT_OWNER") {
    return NextResponse.json({ error: "Faqat markaz egasi xodimni o'zgartiradi" }, { status: 403 });
  }

  const existing = await prisma.user.findFirst({
    where: { id: params.id, tenantId: user.tenantId, role: { in: ["ADMIN", "TENANT_OWNER"] } },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = staffUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const data: any = {};
  if (d.name) data.name = d.name;
  if (d.email !== undefined) data.email = d.email || null;
  if (d.phone !== undefined) data.phone = d.phone || null;
  if (d.role) data.role = d.role;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.password) data.password = await bcrypt.hash(d.password, 10);

  try {
    const updated = await prisma.user.update({
      where: { id: params.id }, data,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
    });
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId, userId: user.id,
        action: "UPDATE_STAFF", entity: "User", entityId: updated.id,
        changes: { passwordChanged: !!d.password, after: updated } as any,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Email/telefon band" }, { status: 409 });
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (user.role !== "TENANT_OWNER") {
    return NextResponse.json({ error: "Faqat markaz egasi xodimni o'chiradi" }, { status: 403 });
  }
  if (params.id === user.id) {
    return NextResponse.json({ error: "O'zingizni o'chira olmaysiz" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { id: params.id, tenantId: user.tenantId, role: { in: ["ADMIN", "TENANT_OWNER"] } },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await prisma.user.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "DELETE_STAFF", entity: "User", entityId: params.id,
      changes: { deleted: { id: existing.id, name: existing.name, email: existing.email } } as any,
    },
  });
  return NextResponse.json({ ok: true });
}
