import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Turniket webhook endpoint
 * Qurilmadan kelgan signal:
 *   POST /api/turnstile/webhook
 *   Header: x-turnstile-signature: <hmac-sha256>
 *   Body: { tenantId, cardId, deviceId, direction: "IN"|"OUT", occurredAt }
 *
 * Tizim:
 *  1) Imzoni tekshiradi
 *  2) Karta egasini topadi
 *  3) Davomatga yozadi
 *  4) Ota-onaga Telegram orqali xabar yuboradi
 */
export async function POST(req: Request) {
  const secret = process.env.TURNSTILE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Server xato" }, { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get("x-turnstile-signature");
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (signature !== expected) {
    return NextResponse.json({ error: "Imzo noto'g'ri" }, { status: 401 });
  }

  const data = JSON.parse(raw) as {
    tenantId: string;
    cardId: string;
    deviceId?: string;
    direction: "IN" | "OUT";
    occurredAt: string;
  };

  const student = await prisma.student.findFirst({
    where: { tenantId: data.tenantId, cardId: data.cardId },
    include: { parent: { include: { user: true } } },
  });

  // Xom hodisa har holda saqlanadi (audit + qayta ishlash)
  await prisma.turnstileEvent.create({
    data: {
      tenantId: data.tenantId,
      studentId: student?.id,
      cardId: data.cardId,
      deviceId: data.deviceId,
      direction: data.direction,
      rawPayload: data as any,
      occurredAt: new Date(data.occurredAt),
    },
  });

  if (student) {
    // Davomatga yozish (oddiy logika — kuni bo'yicha bitta yozuv)
    const today = new Date(data.occurredAt);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existing = await prisma.attendance.findFirst({
      where: {
        tenantId: data.tenantId,
        studentId: student.id,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    if (data.direction === "IN") {
      if (!existing) {
        await prisma.attendance.create({
          data: {
            tenantId: data.tenantId,
            studentId: student.id,
            status: "PRESENT",
            source: "TURNSTILE",
            enterAt: new Date(data.occurredAt),
          },
        });
      }
    } else {
      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { exitAt: new Date(data.occurredAt) },
        });
      }
    }

    // Ota-onaga Telegram xabari (bot servisiga yuboriladi)
    if (student.parent?.telegramId || student.parent?.user?.telegramId) {
      const chatId = student.parent.telegramId ?? student.parent.user?.telegramId;
      const direction = data.direction === "IN" ? "kirdi" : "chiqdi";
      const time = new Date(data.occurredAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

      // Telegram bot servisiga ichki API orqali yuborish
      fetch(`${process.env.TELEGRAM_BOT_INTERNAL_URL ?? "http://localhost:4000"}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          text: `📍 Farzandingiz ${student.fullName} markazga ${direction}.\n🕐 Vaqt: ${time}`,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
