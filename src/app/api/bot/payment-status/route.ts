// Bot uchun: ota-onaga to'lov holati va qarzdorlik
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateStudentDebt } from "@/lib/debt";

const BOT_SECRET = process.env.BOT_INTERNAL_SECRET || "dev-bot-secret";

export async function GET(req: Request) {
  const auth = req.headers.get("x-bot-secret");
  if (auth !== BOT_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  const lines: string[] = [`💳 <b>To'lov holati</b>\n`];

  for (const child of parent.children) {
    const debt = await calculateStudentDebt(child.id);
    if (!debt) continue;

    lines.push(`👨‍🎓 <b>${child.fullName}</b>`);
    lines.push(`   ✅ Jami to'langan: <b>${debt.paidAmount.toLocaleString("uz-UZ")} so'm</b>`);

    if (debt.debt > 0) {
      lines.push(`   ⚠️ <b>Qarzdorlik: ${debt.debt.toLocaleString("uz-UZ")} so'm</b>`);
      if (debt.unpaidMonths.length > 0) {
        lines.push(`   📅 To'lanmagan oylar: ${debt.unpaidMonths.slice(0, 3).join(", ")}${debt.unpaidMonths.length > 3 ? "..." : ""}`);
      }
      lines.push(`   ‼️ Iltimos, tez orada to'lovni amalga oshiring`);
    } else {
      lines.push(`   ✓ <b>Qarzdorlik yo'q</b> 🎉`);
    }

    // So'nggi 3 ta to'lov
    const recent = await prisma.payment.findMany({
      where: { studentId: child.id, status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    if (recent.length > 0) {
      lines.push(`   📋 So'nggi to'lovlar:`);
      recent.forEach((p) => {
        lines.push(`      • ${Number(p.amount).toLocaleString("uz-UZ")} so'm — ${p.forMonth ?? new Date(p.createdAt).toLocaleDateString("uz-UZ")}`);
      });
    }

    lines.push("");
  }

  return NextResponse.json({ text: lines.join("\n") });
}
