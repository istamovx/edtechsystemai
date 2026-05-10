// Edtech System AI — Telegram bot
// Ota-onalar uchun: davomat, to'lov, imtihon, ogohlantirishlar

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
const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

const states = new Map();

// ========== /start ==========
bot.start(async (ctx) => {
  states.delete(String(ctx.from.id));
  return ctx.reply(
    `Edtech System AI platformaga xush kelibsiz! 🎉\n\n` +
      `Farzandingizni bog'lash uchun pastdagi tugmani bosing.\n` +
      `Bog'langandan keyin avtomatik xabarlar olasiz:\n` +
      `   • Davomat (kelmagan / kech kelgan)\n` +
      `   • Qarzdorlik haqida eslatma\n` +
      `   • Kundalik hisobot (har kuni 20:00)\n` +
      `   • Imtihon natijalari`,
    Markup.keyboard([
      ["👶 Farzandni bog'lash", "📊 Bugungi hisobot"],
      ["💳 To'lov holati", "📝 Imtihon natijalari"],
      ["ℹ️ Yordam"],
    ]).resize()
  );
});

// ========== Farzandni bog'lash — sodda ==========
bot.hears("👶 Farzandni bog'lash", async (ctx) => {
  states.set(String(ctx.from.id), { step: "ask_student_number" });
  return ctx.reply(
    `Farzandingizning <b>6-xonali ID raqamini</b> yuboring.\n\n` +
      `Masalan: <code>#334567</code> yoki <code>334567</code>\n\n` +
      `📌 ID raqamni o'quv markazi xodimidan oling yoki o'quvchi profilidan ko'ring.\n\n` +
      `<i>Qo'shimcha ma'lumot kiritish kerak emas — barchasi avtomatik bog'lanadi.</i>`,
    { parse_mode: "HTML" }
  );
});

// ========== Bugungi hisobot ==========
bot.hears("📊 Bugungi hisobot", async (ctx) => {
  try {
    const res = await fetch(
      `${WEB_API}/api/bot/daily-report?chatId=${ctx.from.id}`,
      { headers: { "x-bot-secret": BOT_SECRET } }
    );
    if (res.status === 404) {
      return ctx.reply(`Siz bog'lanmagansiz. "👶 Farzandni bog'lash" ni bosing.`);
    }
    const json = await res.json();
    return ctx.reply(json.text, { parse_mode: "HTML" });
  } catch {
    return ctx.reply("Server bilan aloqa yo'q.");
  }
});

// ========== To'lov holati ==========
bot.hears("💳 To'lov holati", async (ctx) => {
  try {
    const res = await fetch(
      `${WEB_API}/api/bot/payment-status?chatId=${ctx.from.id}`,
      { headers: { "x-bot-secret": BOT_SECRET } }
    );
    if (res.status === 404) {
      return ctx.reply(`Siz bog'lanmagansiz.`);
    }
    const json = await res.json();
    return ctx.reply(json.text, { parse_mode: "HTML" });
  } catch {
    return ctx.reply("Server bilan aloqa yo'q.");
  }
});

// ========== Imtihon natijalari ==========
bot.hears("📝 Imtihon natijalari", async (ctx) => {
  return ctx.reply(`Imtihon natijalari yaqinda qo'shiladi. Hozircha "📊 Bugungi hisobot" ni ko'ring.`);
});

// ========== Yordam ==========
bot.hears("ℹ️ Yordam", async (ctx) => {
  return ctx.reply(
    `<b>Edtech System AI Bot</b>\n\n` +
      `Bu bot ota-onalar uchun.\n\n` +
      `Tugmalar:\n` +
      `👶 Farzandni bog'lash — ID/telefon orqali bog'lash\n` +
      `📊 Bugungi hisobot — bugungi davomat, baholar\n` +
      `💳 To'lov holati — to'langan summa, qarzdorlik\n\n` +
      `Avtomatik xabarlar:\n` +
      `• Farzand kelmasa darhol xabar\n` +
      `• Kech kelsa xabar\n` +
      `• Qarzdorlik bo'lsa kunlik eslatma (10:00)\n` +
      `• Kundalik hisobot (20:00)\n\n` +
      `Web sayt: ${WEB_API}`,
    { parse_mode: "HTML" }
  );
});

// ========== Bog'lash — bitta qadam ==========
bot.on("text", async (ctx) => {
  const chatId = String(ctx.from.id);
  const state = states.get(chatId);

  // # yoki shunchaki 6-xonali raqam yuborilsa — avtomatik bog'lash
  const text = ctx.message.text.trim();
  const numberMatch = text.match(/^#?(\d{6})$/);

  if (state?.step === "ask_student_number" || numberMatch) {
    if (!numberMatch) {
      return ctx.reply(`❌ Format noto'g'ri. 6-xonali raqam yuboring (masalan: <code>#334567</code>).`, {
        parse_mode: "HTML",
      });
    }
    states.delete(chatId);

    try {
      const res = await fetch(`${WEB_API}/api/bot/link-parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bot-secret": BOT_SECRET },
        body: JSON.stringify({
          studentNumber: numberMatch[1],
          parentChatId: ctx.from.id,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        return ctx.reply(
          `✅ <b>Muvaffaqiyatli bog'landi!</b>\n\n` +
            `🏫 Markaz: <b>${json.student.tenantName}</b>\n` +
            `👨‍🎓 Farzand: <b>${json.student.fullName}</b>\n` +
            `👤 Ota-ona: <b>${json.student.parentName}</b>\n\n` +
            `Endi avtomatik xabarlar olasiz:\n` +
            `• Davomat (kelmagan/kech)\n` +
            `• Qarzdorlik eslatmasi\n` +
            `• Kundalik hisobot 20:00 da\n\n` +
            `Hozir tekshirish uchun "📊 Bugungi hisobot" ni bosing.`,
          { parse_mode: "HTML" }
        );
      }
      return ctx.reply(`❌ ${json.error || "Xatolik"}`);
    } catch {
      return ctx.reply("Server bilan aloqa yo'q.");
    }
  }
});

// ========== HTTP API ==========
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Edtech System AI Bot — running ✅"));
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

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
  const { chatIds, text } = req.body;
  if (!Array.isArray(chatIds) || !text) return res.status(400).json({ error: "Noto'g'ri" });
  let ok = 0, fail = 0;
  for (const id of chatIds) {
    try {
      await bot.telegram.sendMessage(id, text, { parse_mode: "HTML" });
      ok++;
    } catch { fail++; }
  }
  res.json({ sent: ok, failed: fail, total: chatIds.length });
});

// ========== KUNLIK XABARLAR ==========
async function sendDailyReports() {
  console.log("📤 Kundalik hisobotlar...");
  try {
    const res = await fetch(`${WEB_API}/api/bot/daily-report`, {
      method: "POST",
      headers: { "x-bot-secret": BOT_SECRET },
    });
    const json = await res.json();
    let ok = 0, fail = 0;
    for (const msg of json.messages || []) {
      try {
        await bot.telegram.sendMessage(msg.chatId, msg.text, { parse_mode: "HTML" });
        ok++;
      } catch { fail++; }
    }
    console.log(`✅ Hisobot: ${ok} yuborildi, ${fail} xato`);
  } catch (e) {
    console.error("Daily report xatosi:", e.message);
  }
}

async function sendDebtReminders() {
  console.log("💰 Qarzdorlik eslatmalar...");
  try {
    const res = await fetch(`${WEB_API}/api/bot/debt-reminders`, {
      method: "POST",
      headers: { "x-bot-secret": BOT_SECRET },
    });
    const json = await res.json();
    let ok = 0, fail = 0;
    for (const msg of json.messages || []) {
      try {
        await bot.telegram.sendMessage(msg.chatId, msg.text, { parse_mode: "HTML" });
        ok++;
      } catch { fail++; }
    }
    console.log(`✅ Qarzdorlik: ${ok} yuborildi, ${fail} xato`);
  } catch (e) {
    console.error("Debt reminders xatosi:", e.message);
  }
}

// Cron: har daqiqada vaqtni tekshirib, kerakli vaqtda yuborish
function scheduleDailyAt(hour, minute, fn) {
  const check = () => {
    const now = new Date();
    // Toshkent vaqti = UTC+5
    const utcHour = (hour - 5 + 24) % 24;
    if (now.getUTCHours() === utcHour && now.getUTCMinutes() === minute) {
      fn();
    }
  };
  setInterval(check, 60 * 1000);
}

scheduleDailyAt(20, 0, sendDailyReports);  // 20:00 — kundalik hisobot
scheduleDailyAt(10, 0, sendDebtReminders); // 10:00 — qarzdorlik eslatma

// Manual triggers
app.post("/send-daily-now", async (req, res) => {
  if (req.headers["x-bot-secret"] !== BOT_SECRET) return res.status(403).json({ error: "Forbidden" });
  await sendDailyReports();
  res.json({ ok: true });
});

app.post("/send-debt-reminders-now", async (req, res) => {
  if (req.headers["x-bot-secret"] !== BOT_SECRET) return res.status(403).json({ error: "Forbidden" });
  await sendDebtReminders();
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Bot HTTP API: port ${PORT}`));

bot.launch().then(() => console.log("✅ Telegram bot ishga tushdi"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
