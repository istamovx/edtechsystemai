import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { questionUpdateSchema } from "@/lib/validations/exam";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role) && user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const existing = await prisma.examQuestion.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = questionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const data: any = {};
  if (d.subjectId) data.subjectId = d.subjectId;
  if (d.topicId !== undefined) data.topicId = d.topicId || null;
  if (d.text) data.text = d.text;
  if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl || null;
  if (d.type) data.type = d.type;
  if (d.difficulty) data.difficulty = d.difficulty;
  if (d.options) data.options = d.options as any;
  if (d.explanation !== undefined) data.explanation = d.explanation || null;

  const updated = await prisma.examQuestion.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const existing = await prisma.examQuestion.findFirst({
    where: { id: params.id, tenantId: user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await prisma.examQuestion.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
