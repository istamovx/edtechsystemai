import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// DEMO ma'lumotlar — haqiqiy loyihada getServerSession + prisma'dan olinadi
const DEMO_USER = { name: "Jason Ranti", role: "TENANT_OWNER", avatar: null };
const DEMO_ENABLED_MODULES = [
  "dashboard",
  "users",
  "payments",
  "exams",
  "reports",
  "schedule",
  "homework",
  "crm",
  "settings",
];
const DEMO_FRIENDS = [
  { name: "Bagas Mahpie", label: "Friend" },
  { name: "Sir Dandy", label: "Old Friend" },
  { name: "Jhon Tosan", label: "Friend" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#e7e8ec] p-4">
      <Sidebar enabledModules={DEMO_ENABLED_MODULES} user={DEMO_USER} friends={DEMO_FRIENDS} />
      <div className="ml-4 flex-1 overflow-hidden rounded-3xl bg-card">
        <Header user={DEMO_USER} />
        <main className="px-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
