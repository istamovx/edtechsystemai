import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, canManageUsers } from "@/lib/session";
import { extractQuestionsFromImage, extractQuestionsFromText } from "@/lib/ai-vision";

export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await requireTenant();
  if (!canManageUsers(user.role) && user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const { mode, payload, subjectId, topicId } = body as {
    mode: "image" | "text";
    payload: string;
    subjectId?: string;
    topicId?: string;
  };

  if (!mode || !payload) {
    return NextResponse.json({ error: "mode va payload kerak" }, { status: 400 });
  }

  try {
    let questions;
    if (mode === "image") {
      // payload = "data:image/png;base64,xxxxx" formatda
      const match = payload.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Noto'g'ri rasm formati" }, { status: 400 });
      }
      const mediaType = match[1] as any;
      const base64 = match[2];
      questions = await extractQuestionsFromImage(base64, mediaType);
    } else {
      questions = await extractQuestionsFromText(payload);
    }

    return NextResponse.json({
      success: true,
      questions,
      hint: "Savollarni ko'rib chiqing va saqlang",
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message ?? "AI tahlil xatosi",
    }, { status: 500 });
  }
}
