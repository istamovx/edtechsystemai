// Bot uchun: ota-onalarga kundalik xabarni shakllantirish
// 2 ta rejim:
//   1. POST /api/bot/daily-report (auth: BOT_SECRET) → barcha ota-onalarga matn list
//   2. GET /api/bot/daily-report?chatId=xxx → bitta ota-ona uchun matn

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function buildSummary(studentId: string): Promise<string> {
  const today = startOfDay();
  const tomorrow = endOfDay();

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      attendances: {
        where: { createdAt: { gte: today, lte: tomorrow } },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        where: { status: "PAID", createdAt: { gte: today, lte: tomorrow } },
      },
      examAttempts: {
        where: { submittedAt: { gte: today, lte: tomorrow } },
        include: { exam: { select: { title: true } } },
      },
      groups: { include: { group: { select: { name: true } } } },
    },
  });

  if (!student) return "O'quvchi topilmadi.";

  const lines: string[] = [];
  lines.push(`📊 <b>${student.fullName}</b> — bugungi hisobot`);
  lines.push(`📅 ${new Date().toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long" })}`);
  lines.push("");

  // Davomat
  const att = student.attendances[0];
  if (att) {
    const enter = att.enterAt ? new Date(att.enterAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "—";
    const exit = att.exitAt ? new Date(att.exitAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "—";
    const statusEmoji = { PRESENT: "✅", ABSENT: "❌", LATE: "⏰", EXCUSED: "📝" }[att.status as string] || "•";
    lines.push(`${statusEmoji} Davomat: <b>${att.status}</b>`);
    lines.push(`   🚪 Kirish: ${enter}, Chiqish: ${exit}`);
  } else {
    lines.push(`⚪️ Davomat: bugun belgilanmagan`);
  }
  lines.push("");

  // To'lov
  if (student.payments.length > 0) {
    const total = student.payments.reduce((s, p) => s + Number(p.amount), 0);
    lines.push(`💰 Bugungi to'lov: <b>${total.toLocaleString("uz-UZ")} so'm</b>`);
  }

  // Imtihonlar
  if (student.examAttempts.length > 0) {
    lines.push(`📝 Bugungi imtihonlar:`);
    student.examAttempts.forEach((a) => {
      lines.push(`   • ${a.exam.title}: ${a.percent?.toFixed(1) ?? "—"}%`);
    });
  }

  // Guruhlari
  if (student.groups.length > 0) {
    const names = student.groups.map((g) => g.group.name).join(", ");
    lines.push("");
    lines.push(`🎓 Guruhlar: ${names}`);
  }

  return lines.join("\n");
}

// POST: barcha bog'langan ota-onalar uchun xabarlar ro'yxati
export async function POST(req: Request) {
  const auth = req.headers.get("x-bot-secret");
  if (auth !== BOT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parents = await prisma.parent.findMany({
    where: { telegramId: { not: null } },
    include: { children: true },
  });

  const messages: { chatId: string; text: string }[] = [];

  for (const parent of parents) {
    if (parent.children.length === 0) continue;
    const summaries = await Promise.all(parent.children.map((c) => buildSummary(c.id)));
    messages.push({
      chatId: parent.telegramId!,
      text: summaries.join("\n\n━━━━━━━━━━━━━━━\n\n"),
    });
  }

  return NextResponse.json({ messages, count: messages.length });
}

// GET: bitta ota-ona uchun (Telegram chatId orqali)
export async function GET(req: Request) {
  const auth = req.headers.get("x-bot-secret");
  if (auth !== BOT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  if (!chatId) return NextResponse.json({ error: "chatId kerak" }, { status: 400 });

  const parent = await prisma.parent.findFirst({
    where: { telegramId: chatId },
    include: { children: true },
  });

  if (!parent) return NextResponse.json({ error: "Bog'lanmagansiz" }, { status: 404 });
  if (parent.children.length === 0) {
    return NextResponse.json({ text: "Sizga bog'langan farzand yo'q." });
  }

  const summaries = await Promise.all(parent.children.map((c) => buildSummary(c.id)));
  return NextResponse.json({
    text: summaries.join("\n\n━━━━━━━━━━━━━━━\n\n"),
    childrenCount: parent.children.length,
  });
}
