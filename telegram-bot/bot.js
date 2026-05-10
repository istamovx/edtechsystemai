// Coursue Telegram Bot
// Ota-onalar, o'quvchilar va o'qituvchilar uchun yagona bot

require("dotenv").config({ path: "../.env" });
const express = require("express");
const { Telegraf, Markup } = require("telegraf");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ========== BOT KOMANDALARI ==========

bot.start(async (ctx) => {
  const chatId = String(ctx.from.id);
  const username = ctx.from.username ?? null;

  // Bog'lanmagan bo'lsa — bog'lash kodini so'rash
  const user = await prisma.user.findFirst({ where: { telegramId: chatId } });
  if (user) {
    return ctx.reply(
      `Salom, ${user.name}! 👋\n\nSiz ${user.role.toLowerCase()} sifatida bog'langansiz.`,
      Markup.keyboard([
        ["📊 Mening natijalarim", "📅 Dars jadvali"],
        ["💳 Balans", "🎓 Imtihonlar"],
        ["⚙️ Sozlamalar"],
      ]).resize()
    );
  }

  return ctx.reply(
    `Coursue platformaga xush kelibsiz! 🎉\n\n` +
      `Hisobingizni bog'lash uchun 6-xonali kodni kiriting.\n` +
      `Kodni o'quv markazingizdan oling yoki shaxsiy kabinetingizdan ko'chiring.`
  );
});

// 6-xonali kod orqali bog'lash
bot.hears(/^\d{6}$/, async (ctx) => {
  const code = ctx.match[0];
  const chatId = String(ctx.from.id);

  // Kodni tekshirish (siz buni Notification jadvalidan yoki Redis'dan olishingiz mumkin)
  const link = await prisma.notification.findFirst({
    where: {
      type: "INFO",
      title: "telegram_link_code",
      message: code,
      readAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!link || !link.userId) {
    return ctx.reply("❌ Kod topilmadi yoki muddati o'tgan. Yangi kod oling.");
  }

  await prisma.user.update({
    where: { id: link.userId },
    data: { telegramId: chatId, telegramUser: ctx.from.username ?? null },
  });
  await prisma.notification.update({
    where: { id: link.id },
    data: { readAt: new Date() },
  });

  ctx.reply("✅ Hisobingiz muvaffaqiyatli bog'landi! /start ni qayta yuboring.");
});

bot.hears("📊 Mening natijalarim", async (ctx) => {
  const user = await prisma.user.findFirst({
    where: { telegramId: String(ctx.from.id) },
    include: { studentProfile: { include: { examAttempts: { take: 5, orderBy: { startedAt: "desc" }, include: { exam: true } } } } },
  });
  if (!user?.studentProfile) return ctx.reply("Sizda o'quvchi profili mavjud emas.");

  const lines = user.studentProfile.examAttempts.map(
    (a) => `• ${a.exam.title} — ${a.percent?.toFixed(1) ?? "—"}%`
  );
  ctx.reply(lines.length ? `📝 So'nggi imtihonlar:\n\n${lines.join("\n")}` : "Hali imtihon topshirmagansiz.");
});

bot.hears("💳 Balans", async (ctx) => {
  const user = await prisma.user.findFirst({
    where: { telegramId: String(ctx.from.id) },
    include: { studentProfile: { include: { payments: true } } },
  });
  if (!user?.studentProfile) return ctx.reply("O'quvchi profili topilmadi.");

  const total = user.studentProfile.payments.reduce(
    (s, p) => s + (p.status === "PAID" ? Number(p.amount) : 0),
    0
  );
  ctx.reply(`💰 Jami to'langan: ${new Intl.NumberFormat("uz-UZ").format(total)} so'm`);
});

// ========== ICHKI API (server tomondan xabar yuborish uchun) ==========
const app = express();
app.use(express.json());

app.post("/notify", async (req, res) => {
  const { chatId, text, parseMode = "HTML" } = req.body;
  if (!chatId || !text) return res.status(400).json({ error: "chatId va text shart" });
  try {
    await bot.telegram.sendMessage(chatId, text, { parse_mode: parseMode });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/broadcast", async (req, res) => {
  const { tenantId, role, text } = req.body;
  if (!tenantId || !text) return res.status(400).json({ error: "tenantId va text shart" });

  const users = await prisma.user.findMany({
    where: {
      tenantId,
      ...(role ? { role } : {}),
      telegramId: { not: null },
    },
    select: { telegramId: true },
  });

  let ok = 0, fail = 0;
  for (const u of users) {
    try {
      await bot.telegram.sendMessage(u.telegramId, text, { parse_mode: "HTML" });
      ok++;
    } catch {
      fail++;
    }
  }
  res.json({ sent: ok, failed: fail, total: users.length });
});

// ========== ISHGA TUSHIRISH ==========
const PORT = process.env.BOT_INTERNAL_PORT || 4000;
app.listen(PORT, () => console.log(`✅ Bot internal API: http://localhost:${PORT}`));

bot.launch().then(() => console.log("✅ Telegram bot ishga tushdi"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
