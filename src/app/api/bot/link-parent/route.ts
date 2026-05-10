// Bot uchun ichki API: ota-ona o'z farzandi student ID si orqali bog'lanadi
// Bot Telegram'da: /farzand <ID> yuboradi → bu endpoint chaqiriladi

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

export async function POST(req: Request) {
  // Bot ↔ Web orasidagi ichki autentifikatsiya
  const auth = req.headers.get("x-bot-secret");
  if (auth !== BOT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { studentIdOrPhone, parentChatId, parentName, parentPhone } = await req.json();
  if (!studentIdOrPhone || !parentChatId) {
    return NextResponse.json({ error: "studentIdOrPhone va parentChatId shart" }, { status: 400 });
  }

  // Studentni topish — ID yoki telefon orqali
  let student = await prisma.student.findFirst({
    where: {
      OR: [
        { id: studentIdOrPhone },
        { phone: studentIdOrPhone },
        { cardId: studentIdOrPhone },
      ],
    },
    include: { parent: true, tenant: { select: { name: true } } },
  });

  if (!student) {
    return NextResponse.json({
      ok: false,
      error: "O'quvchi topilmadi. ID, telefon yoki karta raqamini tekshiring.",
    });
  }

  // Agar ota-ona allaqachon bor bo'lsa — Telegram ID ni yangilaymiz
  if (student.parent) {
    await prisma.parent.update({
      where: { id: student.parent.id },
      data: { telegramId: String(parentChatId) },
    });
  } else {
    // Yangi ota-ona yaratish va biriktirish
    if (!parentName || !parentPhone) {
      return NextResponse.json({
        ok: false,
        needsInfo: true,
        error: "Ota-ona F.I.SH va telefon kerak",
      });
    }
    const parent = await prisma.parent.create({
      data: {
        tenantId: student.tenantId,
        fullName: parentName,
        phone: parentPhone,
        telegramId: String(parentChatId),
      },
    });
    await prisma.student.update({
      where: { id: student.id },
      data: { parentId: parent.id },
    });
  }

  return NextResponse.json({
    ok: true,
    student: {
      id: student.id,
      fullName: student.fullName,
      tenantName: student.tenant.name,
    },
  });
}
