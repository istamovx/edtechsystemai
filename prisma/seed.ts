// Boshlang'ich va demo ma'lumotlar:
// - Super admin
// - Demo o'quv markazi + egasi + admin
// - 5 ta o'qituvchi, 3 ta mentor, 5 ta o'quvchi, 5 ta ota-ona
// - 9 fan + mavzular + 30+ savol (har biriga generator bilan to'ldirish mumkin)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_QUESTIONS, generateMathQuestions } from "./seed-questions";

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

const FAKE_TEACHERS = [
  { fullName: "Karim Sodiqov", phone: "+998901111101", subjects: ["Matematika"], salaryType: "HOURLY", salaryRate: 100000 },
  { fullName: "Dilnoza Rahimova", phone: "+998901111102", subjects: ["Ingliz tili"], salaryType: "MONTHLY", salaryRate: 5000000 },
  { fullName: "Sherzod Akbarov", phone: "+998901111103", subjects: ["Fizika"], salaryType: "PERCENT", salaryRate: 30 },
  { fullName: "Madina Yusupova", phone: "+998901111104", subjects: ["Kimyo", "Biologiya"], salaryType: "HOURLY", salaryRate: 90000 },
  { fullName: "Ravshan Toshmatov", phone: "+998901111105", subjects: ["Tarix", "Ona-tili"], salaryType: "MONTHLY", salaryRate: 4000000 },
];

const FAKE_MENTORS = [
  { fullName: "Bekzod Karimov", phone: "+998901111201", subjects: ["Matematika", "Fizika"], isMentor: true },
  { fullName: "Sevara Ergasheva", phone: "+998901111202", subjects: ["Ingliz tili", "Adabiyot"], isMentor: true },
  { fullName: "Jasur Olimov", phone: "+998901111203", subjects: ["Kimyo", "Biologiya"], isMentor: true },
];

const FAKE_PARENTS = [
  { fullName: "Aliyev Bekzod", phone: "+998901111301" },
  { fullName: "Karimova Mohira", phone: "+998901111302" },
  { fullName: "Yusupov Otabek", phone: "+998901111303" },
  { fullName: "Nazarova Gulnora", phone: "+998901111304" },
  { fullName: "Rahimov Sardor", phone: "+998901111305" },
];

const FAKE_STUDENTS = [
  { fullName: "Aliyev Doniyor", phone: "+998901111401", university: "TATU", faculty: "Dasturiy injiniring", parentIdx: 0 },
  { fullName: "Karimova Sevinch", phone: "+998901111402", university: "ToshDU", faculty: "Fizika", parentIdx: 1 },
  { fullName: "Yusupov Bekzod", phone: "+998901111403", university: "Westminster", faculty: "Iqtisodiyot", parentIdx: 2 },
  { fullName: "Nazarova Madina", phone: "+998901111404", university: "TashFarmI", faculty: "Farmatsevtika", parentIdx: 3 },
  { fullName: "Rahimov Akmal", phone: "+998901111405", university: "Inha University", faculty: "Kompyuter injiniringi", parentIdx: 4 },
];

async function main() {
  console.log("🌱 Seed boshlandi...");

  // 1) SUPER_ADMIN
  const superPwd = await bcrypt.hash("SuperAdmin2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin@coursue.uz" },
    update: {},
    create: { email: "admin@coursue.uz", name: "Platforma Egasi", password: superPwd, role: "SUPER_ADMIN" },
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
        "schedule", "homework", "crm", "branches", "settings",
      ],
    },
  });

  // 3) Markaz egasi
  const ownerPwd = await bcrypt.hash("Owner2026!", 10);
  await prisma.user.upsert({
    where: { email: "owner@demo.uz" },
    update: {},
    create: {
      email: "owner@demo.uz", name: "Sherali Toshev", password: ownerPwd,
      role: "TENANT_OWNER", tenantId: tenant.id,
    },
  });

  // 4) Admin xodim
  const adminPwd = await bcrypt.hash("Admin2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin1@demo.uz" },
    update: {},
    create: {
      email: "admin1@demo.uz", name: "Aziz Karimov", password: adminPwd,
      role: "ADMIN", tenantId: tenant.id,
    },
  });

  // 5) Fanlar va mavzular
  console.log("📚 Fanlar va mavzular...");
  const subjectMap: Record<string, { id: string; topics: { id: string; name: string }[] }> = {};
  for (const s of SUBJECTS_WITH_TOPICS) {
    const subject = await prisma.subject.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: s.slug } },
      update: {},
      create: { tenantId: tenant.id, name: s.name, slug: s.slug },
    });
    const topics = [];
    for (const topicName of s.topics) {
      try {
        const t = await prisma.topic.create({ data: { subjectId: subject.id, name: topicName } });
        topics.push({ id: t.id, name: topicName });
      } catch {
        const existing = await prisma.topic.findFirst({ where: { subjectId: subject.id, name: topicName } });
        if (existing) topics.push({ id: existing.id, name: topicName });
      }
    }
    subjectMap[s.slug] = { id: subject.id, topics };
  }

  // 6) O'qituvchilar
  console.log("👨‍🏫 O'qituvchilar...");
  const teacherIds: string[] = [];
  for (const t of FAKE_TEACHERS) {
    const existing = await prisma.teacher.findFirst({ where: { tenantId: tenant.id, fullName: t.fullName } });
    if (existing) {
      teacherIds.push(existing.id);
      continue;
    }
    const teacher = await prisma.teacher.create({
      data: {
        tenantId: tenant.id,
        fullName: t.fullName,
        phone: t.phone,
        subjects: t.subjects,
        salaryType: t.salaryType as any,
        salaryRate: t.salaryRate,
        status: "ACTIVE",
      },
    });
    teacherIds.push(teacher.id);
  }

  // 7) Mentorlar
  console.log("🎓 Mentorlar...");
  for (const m of FAKE_MENTORS) {
    const existing = await prisma.teacher.findFirst({ where: { tenantId: tenant.id, fullName: m.fullName } });
    if (!existing) {
      await prisma.teacher.create({
        data: {
          tenantId: tenant.id,
          fullName: m.fullName,
          phone: m.phone,
          subjects: m.subjects,
          isMentor: true,
          salaryType: "MONTHLY",
          salaryRate: 3000000,
          status: "ACTIVE",
        },
      });
    }
  }

  // 8) Ota-onalar
  console.log("👨‍👩‍👧 Ota-onalar...");
  const parentIds: string[] = [];
  for (const p of FAKE_PARENTS) {
    const existing = await prisma.parent.findFirst({ where: { tenantId: tenant.id, fullName: p.fullName } });
    if (existing) {
      parentIds.push(existing.id);
      continue;
    }
    const parent = await prisma.parent.create({
      data: { tenantId: tenant.id, fullName: p.fullName, phone: p.phone },
    });
    parentIds.push(parent.id);
  }

  // 9) O'quvchilar
  console.log("👨‍🎓 O'quvchilar...");
  let studentCounter = 100000;
  for (const s of FAKE_STUDENTS) {
    const existing = await prisma.student.findFirst({ where: { tenantId: tenant.id, fullName: s.fullName } });
    if (existing) {
      // Mavjud o'quvchilarga ham ID qo'shish (agar yo'q bo'lsa)
      if (!existing.studentNumber) {
        await prisma.student.update({
          where: { id: existing.id },
          data: { studentNumber: String(++studentCounter) },
        });
      }
      continue;
    }
    await prisma.student.create({
      data: {
        tenantId: tenant.id,
        studentNumber: String(++studentCounter),
        fullName: s.fullName,
        phone: s.phone,
        targetUniversity: s.university,
        targetFaculty: s.faculty,
        parentId: parentIds[s.parentIdx],
        status: "ACTIVE",
      },
    });
  }

  // Mavjud o'quvchilarga ID berish (migratsiyadan keyin)
  const studentsWithoutNumber = await prisma.student.findMany({
    where: { tenantId: tenant.id, studentNumber: null },
  });
  for (const s of studentsWithoutNumber) {
    let num = String(300000 + Math.floor(Math.random() * 700000));
    let tries = 0;
    while (tries < 10) {
      const exists = await prisma.student.findUnique({ where: { studentNumber: num } });
      if (!exists) break;
      num = String(300000 + Math.floor(Math.random() * 700000));
      tries++;
    }
    await prisma.student.update({ where: { id: s.id }, data: { studentNumber: num } });
  }

  // 10) Savollar bazasi
  console.log("📝 Savollar bazasi...");
  let totalQuestions = 0;
  for (const [slug, questions] of Object.entries(ALL_QUESTIONS)) {
    const subject = subjectMap[slug];
    if (!subject) continue;

    for (const q of questions) {
      const topicId = q.topic
        ? subject.topics.find((t) => t.name === q.topic)?.id
        : undefined;

      // Duplikatdan saqlanish — text bo'yicha tekshirish
      const dup = await prisma.examQuestion.findFirst({
        where: { tenantId: tenant.id, subjectId: subject.id, text: q.text },
      });
      if (dup) continue;

      await prisma.examQuestion.create({
        data: {
          tenantId: tenant.id,
          subjectId: subject.id,
          topicId,
          text: q.text,
          type: "SINGLE_CHOICE",
          difficulty: q.difficulty,
          options: q.options as any,
          explanation: q.explanation,
        },
      });
      totalQuestions++;
    }
  }

  // 11) Generator orqali matematika savollarini ko'paytirish (50 ta qo'shimcha)
  console.log("🔢 Matematika generatori...");
  const mathSubject = subjectMap["matematika"];
  if (mathSubject) {
    const algebraTopic = mathSubject.topics.find((t) => t.name === "Algebra")?.id;
    const generated = generateMathQuestions(50);
    for (const g of generated) {
      const dup = await prisma.examQuestion.findFirst({
        where: { tenantId: tenant.id, subjectId: mathSubject.id, text: g.text },
      });
      if (dup) continue;
      await prisma.examQuestion.create({
        data: {
          tenantId: tenant.id,
          subjectId: mathSubject.id,
          topicId: algebraTopic,
          text: g.text,
          type: "SINGLE_CHOICE",
          difficulty: g.difficulty,
          options: g.options as any,
        },
      });
      totalQuestions++;
    }
  }

  console.log(`\n✅ Seed yakunlandi!`);
  console.log(`   📚 ${Object.keys(subjectMap).length} ta fan`);
  console.log(`   📝 ${totalQuestions} ta savol`);
  console.log(`   👨‍🏫 ${FAKE_TEACHERS.length} o'qituvchi + ${FAKE_MENTORS.length} mentor`);
  console.log(`   👨‍🎓 ${FAKE_STUDENTS.length} o'quvchi + ${FAKE_PARENTS.length} ota-ona`);
  console.log(`\n🔑 Akkauntlar:`);
  console.log(`   Super admin: admin@coursue.uz / SuperAdmin2026!`);
  console.log(`   Markaz egasi: owner@demo.uz / Owner2026!`);
  console.log(`   Admin: admin1@demo.uz / Admin2026!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
