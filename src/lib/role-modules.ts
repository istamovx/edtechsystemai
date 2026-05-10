// Har bir rol uchun mavjud modullar ro'yxati
import type { ModuleDef } from "./modules";
import { ALL_MODULES } from "./modules";

// Har bir rol uchun ruxsat etilgan modul kalitlari
const ROLE_MODULE_KEYS: Record<string, string[]> = {
  TENANT_OWNER: [
    "dashboard", "users", "payments", "exams", "reports",
    "schedule", "homework", "crm", "branches",
    "marketing", "certificates", "salary", "gamification", "audit",
    "settings",
  ],
  ADMIN: [
    "dashboard", "users", "payments", "exams", "reports",
    "schedule", "homework", "crm", "branches",
    "marketing", "certificates",
    "settings",
  ],
  TEACHER: [
    "dashboard", "schedule", "exams", "homework", "reports",
  ],
  MENTOR: [
    "dashboard", "schedule", "users", "reports",
  ],
  STUDENT: [
    "dashboard", "exams", "homework", "schedule",
  ],
  PARENT: [
    "dashboard", "payments",
  ],
  SUPER_ADMIN: [
    "dashboard", "users", "payments", "exams", "reports",
    "schedule", "homework", "crm", "branches",
    "marketing", "certificates", "salary", "gamification", "audit",
    "settings",
  ],
};

/**
 * Rol va tenant'da yoqilgan modullar kesishmasini qaytaradi
 */
export function getModulesForRole(role: string, tenantEnabled: string[]): ModuleDef[] {
  const allowed = ROLE_MODULE_KEYS[role] ?? [];
  // Rol uchun ruxsat etilgan VA tenant'da yoqilgan
  const intersection = allowed.filter((k) => tenantEnabled.includes(k));
  return ALL_MODULES.filter((m) => intersection.includes(m.key));
}

/**
 * Rolga qarab dashboard sarlavhasi
 */
export const ROLE_DASHBOARD_TITLE: Record<string, string> = {
  TENANT_OWNER: "Markaz boshqaruvi",
  ADMIN: "Administrator paneli",
  TEACHER: "O'qituvchi paneli",
  MENTOR: "Mentor paneli",
  STUDENT: "O'quvchi paneli",
  PARENT: "Ota-ona paneli",
  SUPER_ADMIN: "Super admin paneli",
};
