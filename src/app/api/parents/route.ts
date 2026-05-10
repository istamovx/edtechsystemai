import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { parentCreateSchema } from "@/lib/validations/parent";

export async function GET() {
  const user = await requireTenant();
  const parents = await prisma.parent.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      children: { select: { id: true, fullName: true } },
    },
  });
  return NextResponse.json({ data: parents });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json();
  const parsed = parentCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const parent = await prisma.parent.create({
    data: {
      tenantId: user.tenantId,
      fullName: d.fullName,
      phone: d.phone,
      telegramId: d.telegramId || undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId, userId: user.id,
      action: "CREATE_PARENT", entity: "Parent", entityId: parent.id,
      changes: { created: parent } as any,
    },
  });

  return NextResponse.json({ data: parent }, { status: 201 });
}
