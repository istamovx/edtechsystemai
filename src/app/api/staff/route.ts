import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { staffCreateSchema } from "@/lib/validations/staff";

export async function GET() {
  const user = await requireTenant();
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const staff = await prisma.user.findMany({
    where: {
      tenantId: user.tenantId,
      role: { in: ["ADMIN", "TENANT_OWNER"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      isActive: true, lastLoginAt: true, createdAt: true,
    },
  });
  return NextResponse.json({ data: staff });
}

export async function POST(req: Request) {
  const user = await requireTenant();
  if (user.role !== "TENANT_OWNER") {
    return NextResponse.json({ error: "Faqat markaz egasi xodim qo'shadi" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = staffCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  if (!d.password) return NextResponse.json({ error: "Yangi xodim uchun parol kerak" }, { status: 400 });

  try {
    const hashed = await bcrypt.hash(d.password, 10);
    const newUser = await prisma.user.create({
      data: {
        tenantId: user.tenantId,
        name: d.name,
        email: d.email || undefined,
        phone: d.phone || undefined,
        password: hashed,
        role: d.role,
        isActive: true,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId, userId: user.id,
        action: "CREATE_STAFF", entity: "User", entityId: newUser.id,
        changes: { created: { ...newUser, password: "[REDACTED]" } } as any,
      },
    });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Bu email/telefon allaqachon mavjud" }, { status: 409 });
    return NextResponse.json({ error: e.message ?? "Server xatosi" }, { status: 500 });
  }
}
