import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { studentUpdateSchema } from "@/lib/validations/student";

// GET /api/students/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  const student = await prisma.student.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      parent: true,
      branch: true,
      groups: { include: { group: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
      attendances: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!student) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ data: student });
}

// PATCH /api/students/:id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const existing = await prisma.student.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = studentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const cleanData: any = {};
  for (const [k, v] of Object.entries(d)) {
    if (v === "" || v === undefined) continue;
    if (k === "birthDate" && typeof v === "string") cleanData[k] = new Date(v);
    else cleanData[k] = v;
  }

  try {
    const updated = await prisma.student.update({
      where: { id: params.id },
      data: cleanData,
    });
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: "UPDATE_STUDENT",
        entity: "Student",
        entityId: updated.id,
        changes: { before: existing, after: updated } as any,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Bu karta ID boshqa o'quvchida bor" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}

// DELETE /api/students/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const existing = await prisma.student.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await prisma.student.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      action: "DELETE_STUDENT",
      entity: "Student",
      entityId: params.id,
      changes: { deleted: existing } as any,
    },
  });
  return NextResponse.json({ ok: true });
}
