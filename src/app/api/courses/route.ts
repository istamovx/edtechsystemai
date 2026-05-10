import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { courseCreateSchema } from "@/lib/validations/group";

export async function GET() {
  const user = await requireTenant();
  const courses = await prisma.course.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { groups: true } } },
  });
  return NextResponse.json({ data: courses });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json();
  const parsed = courseCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const course = await prisma.course.create({
    data: {
      tenantId: user.tenantId,
      name: d.name,
      description: d.description || undefined,
      duration: d.duration ?? undefined,
      price: Number(d.price),
    },
  });
  return NextResponse.json({ data: course }, { status: 201 });
}
