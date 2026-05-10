// Coursue Telegram Bot — minimal versiya (production'ga tayyor)
// DB operatsiyalari asosiy web app orqali, bot esa Telegram + HTTP gateway

require("dotenv").config({ path: "../.env" });
const express = require("express");
const { Telegraf, Markup } = require("telegraf");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN mavjud emas!");
  process.exit(1);
}

const bot = new Telegraf(TOKEN);
const WEB_API = process.env.WEB_API_URL || "http://localhost:3000";

// ========== BOT KOMANDALARI ==========

bot.start(async (ctx) => {
  return ctx.reply(
    `Edtech System AI platformaga xush kelibsiz! 🎉\n\n` +
      `Hisobingizni bog'lash uchun web saytda Settings → Telegram bo'limidan 6-xonali kodni oling va shu yerga yuboring.`,
    Markup.keyboard([["📊 Mening natijalarim", "💳 Balans"], ["📅 Dars jadvali", "ℹ️ Yordam"]]).resize()
  );
});

// 6-xonali kod orqali bog'lash — web API ga yuboriladi
bot.hears(/^\d{6}$/, async (ctx) => {
  const code = ctx.match[0];
  const chatId = String(ctx.from.id);

  try {
    const res = await fetch(`${WEB_API}/api/telegram/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, chatId, username: ctx.from.username }),
    });
    const data = await res.json();
    if (data.success) {
      ctx.reply(`✅ Salom, ${data.userName}! Hisobingiz bog'landi.`);
    } else {
      ctx.reply(`❌ ${data.error || "Kod noto'g'ri yoki muddati o'tgan"}`);
    }
  } catch (e) {
    ctx.reply("Server bilan aloqa yo'q. Keyinroq urinib ko'ring.");
  }
});

bot.hears("📊 Mening natijalarim", async (ctx) => {
  ctx.reply("Iltimos, web saytdan natijalarni ko'ring: " + WEB_API);
});
bot.hears("💳 Balans", async (ctx) => {
  ctx.reply("Iltimos, web saytdan balansingizni tekshiring: " + WEB_API);
});
bot.hears("📅 Dars jadvali", async (ctx) => {
  ctx.reply("Dars jadvalini web saytdan ko'ring: " + WEB_API);
});
bot.hears("ℹ️ Yordam", async (ctx) => {
  ctx.reply(`Edtech System AI — o'quv markazlari uchun AI platforma.\n\nWeb sayt: ${WEB_API}\nQo'llab-quvvatlash: @your_support`);
});

// ========== HTTP API ==========
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Edtech System AI Bot — running ✅"));
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// Web app serverdan xabar yuborish
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

// Broadcast: web app yuboradi qabul qiluvchilar ro'yxatini
app.post("/broadcast", async (req, res) => {
  const { chatIds, text } = req.body;
  if (!Array.isArray(chatIds) || !text) {
    return res.status(400).json({ error: "chatIds (array) va text shart" });
  }
  let ok = 0, fail = 0;
  for (const id of chatIds) {
    try {
      await bot.telegram.sendMessage(id, text, { parse_mode: "HTML" });
      ok++;
    } catch {
      fail++;
    }
  }
  res.json({ sent: ok, failed: fail, total: chatIds.length });
});

// ========== ISHGA TUSHIRISH ==========
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Bot HTTP API: port ${PORT}`));

bot.launch().then(() => console.log("✅ Telegram bot ishga tushdi"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
