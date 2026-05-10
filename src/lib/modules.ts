// Modullar tizimi: har bir markaz qaysi modullarni yoqishi mumkin
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  GraduationCap,
  Calendar,
  BookOpen,
  Megaphone,
  Award,
  Building2,
  Trophy,
  ScrollText,
  UserPlus,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

export interface ModuleDef {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  description: string;
  requiredPlan?: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  group: "core" | "extra" | "advanced";
}

export const ALL_MODULES: ModuleDef[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", description: "Asosiy ko'rinish va statistika", group: "core" },
  { key: "users", label: "Foydalanuvchilar", icon: Users, href: "/users", description: "O'quvchi, o'qituvchi, mentor, ota-ona", group: "core" },
  { key: "payments", label: "To'lovlar", icon: CreditCard, href: "/payments", description: "To'lov va qarzdorlik hisobotlari", group: "core" },
  { key: "exams", label: "Imtihonlar", icon: GraduationCap, href: "/exams", description: "AI tahlili bilan testlar", group: "core" },
  { key: "reports", label: "Hisobotlar", icon: BarChart3, href: "/reports", description: "Davomat, moliyaviy va boshqa hisobotlar", group: "core" },

  { key: "schedule", label: "Dars jadvali", icon: Calendar, href: "/schedule", description: "Guruhlar, xonalar, jadval", group: "extra" },
  { key: "homework", label: "Uy vazifalari", icon: BookOpen, href: "/homework", description: "Vazifa berish va tekshirish", group: "extra" },
  { key: "crm", label: "CRM (Lid'lar)", icon: UserPlus, href: "/crm", description: "Yangi qiziquvchilar voronkasi", group: "extra" },
  { key: "marketing", label: "Marketing", icon: Megaphone, href: "/marketing", description: "SMS / Telegram broadcast", group: "extra" },
  { key: "certificates", label: "Sertifikatlar", icon: Award, href: "/certificates", description: "Avtomatik sertifikat yaratish", group: "extra" },

  { key: "branches", label: "Filiallar", icon: Building2, href: "/branches", description: "Filiallar va xonalar", group: "extra" },
  { key: "salary", label: "Maoshlar", icon: DollarSign, href: "/salary", description: "O'qituvchi maoshlari", group: "advanced", requiredPlan: "PRO" },
  { key: "gamification", label: "Gamifikatsiya", icon: Trophy, href: "/gamification", description: "Reyting, badge'lar", group: "advanced", requiredPlan: "PRO" },
  { key: "audit", label: "Audit log", icon: ScrollText, href: "/audit", description: "Kim nima o'zgartirgani", group: "advanced", requiredPlan: "ENTERPRISE" },

  { key: "settings", label: "Sozlamalar", icon: Settings, href: "/settings", description: "Til, mavzu va boshqalar", group: "core" },
];

export function getEnabledModules(enabled: string[]): ModuleDef[] {
  return ALL_MODULES.filter((m) => enabled.includes(m.key));
}

export function isModuleEnabled(enabled: string[], key: string): boolean {
  return enabled.includes(key);
}
