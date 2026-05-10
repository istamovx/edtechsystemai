// Qarzdorlik hisoblash mantiqiyligi
// Har bir o'quvchi uchun: oylik to'lov × o'qigan oylar - jami to'langan

import { prisma } from "./prisma";

export interface StudentDebt {
  studentId: string;
  fullName: string;
  parentChatId?: string | null;
  expectedAmount: number; // jami kutilgan
  paidAmount: number; // jami to'langan
  debt: number; // qarzdorlik
  unpaidMonths: string[]; // "YYYY-MM" formatda
  monthlyFee: number;
}

/**
 * Bitta o'quvchi qarzdorligini hisoblash
 */
export async function calculateStudentDebt(studentId: string): Promise<StudentDebt | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      parent: { select: { telegramId: true } },
      groups: {
        include: {
          group: { include: { course: { select: { price: true } } } },
        },
      },
      payments: { where: { status: "PAID" } },
    },
  });
  if (!student) return null;

  // Eng yuqori narxli kursni topish (oylik to'lov sifatida)
  let monthlyFee = 0;
  for (const m of student.groups) {
    const price = Number(m.group.course?.price ?? 0);
    if (price > monthlyFee) monthlyFee = price;
  }

  // Qancha oy o'qigan (yaratilganidan boshlab)
  const monthsSince = monthsBetween(student.createdAt, new Date());

  // Har oy kutilayotgan to'lov
  const expectedAmount = monthlyFee * monthsSince;

  // Jami to'langan
  const paidAmount = student.payments.reduce((s, p) => s + Number(p.amount), 0);

  // Oylik to'lovlar tekshiruvi
  const paidMonths = new Set(student.payments.filter((p) => p.forMonth).map((p) => p.forMonth!));
  const unpaidMonths: string[] = [];
  for (let i = 0; i < monthsSince; i++) {
    const d = new Date(student.createdAt);
    d.setMonth(d.getMonth() + i);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!paidMonths.has(m)) unpaidMonths.push(m);
  }

  const debt = Math.max(0, expectedAmount - paidAmount);

  return {
    studentId: student.id,
    fullName: student.fullName,
    parentChatId: student.parent?.telegramId ?? null,
    expectedAmount,
    paidAmount,
    debt,
    unpaidMonths,
    monthlyFee,
  };
}

/**
 * Tenant'dagi barcha qarzdor o'quvchilar
 */
export async function getDebtors(tenantId: string): Promise<StudentDebt[]> {
  const students = await prisma.student.findMany({
    where: { tenantId, status: "ACTIVE" },
    select: { id: true },
  });

  const results: StudentDebt[] = [];
  for (const s of students) {
    const debt = await calculateStudentDebt(s.id);
    if (debt && debt.debt > 0) results.push(debt);
  }
  return results.sort((a, b) => b.debt - a.debt);
}

function monthsBetween(start: Date, end: Date): number {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months); // Kamida 1 oy
}
