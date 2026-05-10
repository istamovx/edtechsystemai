// Tenant-aware session helpers
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: "SUPER_ADMIN" | "TENANT_OWNER" | "ADMIN" | "TEACHER" | "MENTOR" | "STUDENT" | "PARENT";
  tenantId: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role,
    tenantId: (session.user as any).tenantId ?? null,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireTenant(): Promise<SessionUser & { tenantId: string }> {
  const user = await requireUser();
  if (!user.tenantId) redirect("/login"); // SUPER_ADMIN boshqa joyga yo'naltiriladi
  return user as any;
}

export function canManageUsers(role: SessionUser["role"]): boolean {
  return ["TENANT_OWNER", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canViewFinance(role: SessionUser["role"]): boolean {
  return ["TENANT_OWNER", "ADMIN", "SUPER_ADMIN"].includes(role);
}
