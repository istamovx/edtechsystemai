// Unikal 6-xonali studentNumber generator (300000-999999 oralig'ida)
import { prisma } from "./prisma";

export async function generateStudentNumber(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const num = String(Math.floor(300000 + Math.random() * 700000));
    const exists = await prisma.student.findUnique({
      where: { studentNumber: num },
      select: { id: true },
    });
    if (!exists) return num;
  }
  // Fallback — vaqt bilan
  return String(Date.now()).slice(-6);
}
