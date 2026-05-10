// Bot uchun: ota-ona faqat 6-xonali studentNumber yuboradi
// Telegram chatId student'ning mavjud parent'iga biriktiriladi

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

export async function POST(req: Request) {
  const auth = req.headers.get("x-bot-secret");
  if (auth !== BOT_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { studentNumber, parentChatId } = await req.json();
  if (!studentNumber || !parentChatId) {
    return NextResponse.json({ error: "studentNumber va parentChatId shart" }, { status: 400 });
  }

  // Faqat raqamni qabul qilish (# bo'lsa olib tashlash)
  const cleanNumber = String(studentNumber).replace(/[^\d]/g, "");

  const student = await prisma.student.findFirst({
    where: { studentNumber: cleanNumber },
    include: {
      parent: true,
      tenant: { select: { name: true } },
    },
  });

  if (!student) {
    return NextResponse.json({
      ok: false,
      error: `${cleanNumber} ID raqamli o'quvchi topilmadi. ID ni o'quv markazidan oling.`,
    });
  }

  if (!student.parent) {
    return NextResponse.json({
      ok: false,
      error: `Bu o'quvchiga ota-ona biriktirilmagan. O'quv markazi xodimiga murojaat qiling.`,
    });
  }

  // Telegram ID ni mavjud ota-ona yozuviga biriktirish
  await prisma.parent.update({
    where: { id: student.parent.id },
    data: { telegramId: String(parentChatId) },
  });

  return NextResponse.json({
    ok: true,
    student: {
      id: student.id,
      fullName: student.fullName,
      tenantName: student.tenant.name,
      parentName: student.parent.fullName,
    },
  });
}
