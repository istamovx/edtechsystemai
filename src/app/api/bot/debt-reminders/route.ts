// Qarzdor ota-onalarga ogohlantirish — bot kuniga 1 marta chaqiradi
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDebtors } from "@/lib/debt";

const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

export async function POST(req: Request) {
  const auth = req.headers.get("x-bot-secret");
  if (auth !== BOT_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });
  const messages: { chatId: string; text: string }[] = [];

  for (const tenant of tenants) {
    const debtors = await getDebtors(tenant.id);
    for (const d of debtors) {
      if (!d.parentChatId) continue;
      const text =
        `⚠️ <b>Qarzdorlik haqida eslatma</b>\n\n` +
        `🏫 ${tenant.name}\n` +
        `👨‍🎓 ${d.fullName}\n\n` +
        `💰 Qarzdorlik: <b>${d.debt.toLocaleString("uz-UZ")} so'm</b>\n` +
        (d.unpaidMonths.length > 0
          ? `📅 To'lanmagan oylar: ${d.unpaidMonths.join(", ")}\n`
          : "") +
        `\nIltimos, tez orada to'lovni amalga oshiring.\n` +
        `Savollar bo'lsa o'quv markazi bilan bog'laning.`;
      messages.push({ chatId: d.parentChatId, text });
    }
  }

  return NextResponse.json({ messages, count: messages.length });
}
