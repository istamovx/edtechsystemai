// Boshlang'ich ma'lumotlar: super admin + demo o'quv markazi + fanlar
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUBJECTS_WITH_TOPICS = [
  { name: "Ona-tili", slug: "ona-tili", topics: ["Fonetika", "Morfologiya", "Sintaksis", "Leksikologiya", "Imlo"] },
  { name: "Adabiyot", slug: "adabiyot", topics: ["Mumtoz adabiyot", "XX asr", "Zamonaviy", "Adabiy nazariya"] },
  { name: "Tarix", slug: "tarix", topics: ["O'zbekiston tarixi", "Jahon tarixi", "Mustaqillik davri"] },
  { name: "Rus tili", slug: "rus-tili", topics: ["Грамматика", "Лексика", "Чтение"] },
  { name: "Ingliz tili", slug: "ingliz-tili", topics: ["Grammar", "Vocabulary", "Reading", "Listening"] },
  { name: "Fizika", slug: "fizika", topics: ["Mexanika", "Elektr", "Optika", "Termodinamika", "Kvant"] },
  { name: "Matematika", slug: "matematika", topics: ["Algebra", "Geometriya", "Trigonometriya", "Matematik analiz"] },
  { name: "Kimyo", slug: "kimyo", topics: ["Anorganik", "Organik", "Umumiy kimyo"] },
  { name: "Biologiya", slug: "biologiya", topics: ["Botanika", "Zoologiya", "Anatomiya", "Genetika"] },
];

async function main() {
  // 1) SUPER_ADMIN
  const superPwd = await bcrypt.hash("SuperAdmin2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin@coursue.uz" },
    update: {},
    create: {
      email: "admin@coursue.uz",
      name: "Platforma Egasi",
      password: superPwd,
      role: "SUPER_ADMIN",
    },
  });

  // 2) Demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-markaz" },
    update: {},
    create: {
      name: "Demo O'quv Markazi",
      slug: "demo-markaz",
      phone: "+998 71 123 45 67",
      email: "info@demo.uz",
      address: "Toshkent shahar, Mirzo Ulug'bek tumani",
      subscriptionPlan: "PRO",
      enabledModules: [
        "dashboard", "users", "payments", "exams", "reports",
        "schedule", "homework", "crm", "settings",
      ],
    },
  });

  // 3) Tenant owner
  const ownerPwd = await bcrypt.hash("Owner2026!", 10);
  await prisma.user.upsert({
    where: { email: "owner@demo.uz" },
    update: {},
    create: {
      email: "owner@demo.uz",
      name: "Markaz Egasi",
      password: ownerPwd,
      role: "TENANT_OWNER",
      tenantId: tenant.id,
    },
  });

  // 4) Fanlar va mavzular
  for (const s of SUBJECTS_WITH_TOPICS) {
    const subject = await prisma.subject.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: s.slug } },
      update: {},
      create: { tenantId: tenant.id, name: s.name, slug: s.slug },
    });
    for (const topicName of s.topics) {
      await prisma.topic.create({
        data: { subjectId: subject.id, name: topicName },
      }).catch(() => {});
    }
  }

  console.log("✅ Seed yakunlandi!");
  console.log("Super admin: admin@coursue.uz / SuperAdmin2026!");
  console.log("Markaz egasi: owner@demo.uz / Owner2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
