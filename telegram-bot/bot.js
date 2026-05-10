// Edtech System AI — Telegram bot
// Ota-onalar uchun: farzandni bog'lash + kundalik hisobot

require("dotenv").config({ path: "../.env" });
const express = require("express");
const { Telegraf, Markup, session } = require("telegraf");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN mavjud emas!");
  process.exit(1);
}

const bot = new Telegraf(TOKEN);
const WEB_API = process.env.WEB_API_URL || "http://localhost:3000";
const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

// Conversation state — chatId → { step, data }
const states = new Map();

// ========== /start ==========
bot.start(async (ctx) => {
  states.delete(String(ctx.from.id));
  return ctx.reply(
    `Edtech System AI platformaga xush kelibsiz! 🎉\n\n` +
      `Farzandingizni bog'lash uchun pastdagi tugmani bosing.\n` +
      `Bog'langandan keyin har kuni avtomatik hisobot yuboriladi:\n` +
      `   • Davomat (kirish/chiqish vaqti)\n` +
      `   • To'lovlar\n` +
      `   • Imtihon natijalari\n` +
      `   • Guruhlari`,
    Markup.keyboard([
      ["👶 Farzandni bog'lash", "📊 Bugungi hisobot"],
      ["💳 To'lov holati", "ℹ️ Yordam"],
    ]).resize()
  );
});

// ========== Farzandni bog'lash sehri ==========
bot.hears("👶 Farzandni bog'lash", async (ctx) => {
  states.set(String(ctx.from.id), { step: "ask_id" });
  return ctx.reply(
    `Farzandingizning ID raqamini yoki telefon raqamini yuboring.\n\n` +
      `Masalan: <code>+998901234567</code> yoki <code>cm5x...</code>\n\n` +
      `ID ni o'quv markazi xodimidan oling.`,
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
      return ctx.reply(
        `Siz hali bog'lanmagansiz. "👶 Farzandni bog'lash" tugmasini bosing.`
      );
    }
    const json = await res.json();
    return ctx.reply(json.text, { parse_mode: "HTML" });
  } catch (e) {
    return ctx.reply("Server bilan aloqa yo'q. Keyinroq urinib ko'ring.");
  }
});

// ========== To'lov holati ==========
bot.hears("💳 To'lov holati", async (ctx) => {
  // Kelajakda alohida endpoint qilamiz
  return ctx.reply(`To'lov tarixi tez orada qo'shiladi.`);
});

// ========== Yordam ==========
bot.hears("ℹ️ Yordam", async (ctx) => {
  return ctx.reply(
    `<b>Edtech System AI Bot</b>\n\n` +
      `Bu bot ota-onalar uchun mo'ljallangan.\n` +
      `Farzandingizning kundalik faoliyatini avtomatik kuzatasiz.\n\n` +
      `Buyruqlar:\n` +
      `/start - Boshlash\n` +
      `👶 Farzandni bog'lash - ID orqali bog'lash\n` +
      `📊 Bugungi hisobot - Hozirgi holat\n\n` +
      `Web sayt: ${WEB_API}\n` +
      `Yordam: o'quv markazi administratori`,
    { parse_mode: "HTML" }
  );
});

// ========== Universal handler — state bo'yicha ==========
bot.on("text", async (ctx) => {
  const chatId = String(ctx.from.id);
  const state = states.get(chatId);
  if (!state) return; // Yo'naltirilmagan matn

  const text = ctx.message.text.trim();

  if (state.step === "ask_id") {
    state.data = { studentIdOrPhone: text };
    state.step = "ask_parent_name";
    states.set(chatId, state);
    return ctx.reply(
      `Endi sizning F.I.SH ni yuboring (masalan: Aliyev Bekzod):`
    );
  }

  if (state.step === "ask_parent_name") {
    state.data.parentName = text;
    state.step = "ask_parent_phone";
    states.set(chatId, state);
    return ctx.reply(
      `Telefon raqamingizni yuboring (masalan: +998901234567):`
    );
  }

  if (state.step === "ask_parent_phone") {
    state.data.parentPhone = text;
    states.delete(chatId);

    // API ga yuborish
    try {
      const res = await fetch(`${WEB_API}/api/bot/link-parent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bot-secret": BOT_SECRET,
        },
        body: JSON.stringify({
          studentIdOrPhone: state.data.studentIdOrPhone,
          parentChatId: ctx.from.id,
          parentName: state.data.parentName,
          parentPhone: state.data.parentPhone,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        return ctx.reply(
          `✅ Muvaffaqiyatli bog'landi!\n\n` +
            `🏫 Markaz: <b>${json.student.tenantName}</b>\n` +
            `👨‍🎓 Farzand: <b>${json.student.fullName}</b>\n\n` +
            `Endi har kuni avtomatik hisobot yuboriladi.\n` +
            `Hoziroq tekshirish uchun "📊 Bugungi hisobot" ni bosing.`,
          { parse_mode: "HTML" }
        );
      } else {
        return ctx.reply(`❌ ${json.error || "Xatolik"}`);
      }
    } catch (e) {
      return ctx.reply("Server bilan aloqa yo'q. Keyinroq urinib ko'ring.");
    }
  }
});

// ========== HTTP API (web app uchun) ==========
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Edtech System AI Bot — running ✅"));
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// Web app dan kelgan xabarlarni Telegram'ga yuborish
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

// Broadcast (web app yuboradi)
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

// ========== KUNLIK HISOBOT — har kuni 20:00 da ==========
async function sendDailyReports() {
  console.log("📤 Kundalik hisobotlar yuborilmoqda...");
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
      } catch {
        fail++;
      }
    }
    console.log(`✅ Yuborildi: ${ok}, Muvaffaqiyatsiz: ${fail}`);
  } catch (e) {
    console.error("Daily report error:", e.message);
  }
}

// Har kuni 20:00 (Toshkent vaqti) — aslida productionda cron job tavsiya
function scheduleDailyAt(hour, minute, fn) {
  const check = () => {
    const now = new Date();
    if (now.getUTCHours() === (hour - 5 + 24) % 24 && now.getUTCMinutes() === minute) {
      fn();
    }
  };
  setInterval(check, 60 * 1000); // har daqiqa tekshirish
}
scheduleDailyAt(20, 0, sendDailyReports);

// Manual trigger (admin uchun)
app.post("/send-daily-now", async (req, res) => {
  const auth = req.headers["x-bot-secret"];
  if (auth !== BOT_SECRET) return res.status(403).json({ error: "Forbidden" });
  await sendDailyReports();
  res.json({ ok: true });
});

// ========== ISHGA TUSHIRISH ==========
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Bot HTTP API: port ${PORT}`));

bot.launch().then(() => console.log("✅ Telegram bot ishga tushdi"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
