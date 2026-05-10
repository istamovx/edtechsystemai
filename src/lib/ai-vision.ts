// Claude Vision API: rasmdan savollarni o'qib chiqarish
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ExtractedQuestion {
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty?: number;
  topicHint?: string;
}

const SYSTEM_PROMPT = `Sen DTM (O'zbekiston Davlat Test Markazi) standartiga mos savollarni rasmdan yoki matndan o'qib oluvchi yordamchisan.

Vazifang:
1. Rasm yoki matnda berilgan savollarni aniqlash
2. Har bir savol uchun matn, variantlar va to'g'ri javobni aniqlash
3. Matematik formulalarni LaTeX ko'rinishida ($...$) qaytarish
4. Natijani toza JSON shaklda qaytarish

Misol:
Kirish: "If (2a+b)/(a+4b) = 3, then find the value of (a+b)/(a+2b) = ?"
Variantlar: A) 5/9  B) 2/7  C) 10/7  D) 10/9

Chiqish JSON:
{
  "text": "Agar $\\\\frac{2a+b}{a+4b} = 3$ bo'lsa, $\\\\frac{a+b}{a+2b}$ ifodaning qiymatini toping.",
  "options": [
    {"id": "A", "text": "$\\\\frac{5}{9}$", "isCorrect": false},
    {"id": "B", "text": "$\\\\frac{2}{7}$", "isCorrect": false},
    {"id": "C", "text": "$\\\\frac{10}{7}$", "isCorrect": true},
    {"id": "D", "text": "$\\\\frac{10}{9}$", "isCorrect": false}
  ],
  "explanation": "(2a+b) = 3(a+4b) → 2a+b = 3a+12b → -a = 11b → a = -11b. (a+b)/(a+2b) = (-11b+b)/(-11b+2b) = -10b/-9b = 10/9. Tekshirish kerak.",
  "difficulty": 3,
  "topicHint": "Algebra - kasrli ifodalar"
}

MUHIM qoidalar:
- Faqat JSON array qaytar (oddiy matn yo'q)
- Agar to'g'ri javob noma'lum bo'lsa, mantiqiy yechib aniqlashga harakat qil
- Formula bo'lsa LaTeX ($...$) ishlat
- Savol matnini o'zbek tiliga moslab qaytar (ingliz/rus bo'lsa tarjima qil)
- difficulty: 1 (juda oson) dan 5 (juda qiyin) gacha`;

/**
 * Rasm (base64) dan savollarni AI yordamida o'qib chiqarish
 */
export async function extractQuestionsFromImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/png"
): Promise<ExtractedQuestion[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Bu rasmdagi barcha savollarni o'qib, JSON array shaklida qaytaring. Faqat JSON, qo'shimcha matn yo'q.",
          },
        ],
      },
    ],
  });

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    // Bitta savol bo'lishi mumkin
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) return [JSON.parse(objMatch[0])];
    throw new Error("AI javobida JSON topilmadi");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Matn (DTM kitobidan ko'chirilgan) dan savollarni o'qib chiqarish
 */
export async function extractQuestionsFromText(rawText: string): Promise<ExtractedQuestion[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Quyidagi matndan barcha savollarni JSON array shaklida ajratib oling. Faqat JSON, qo'shimcha matn yo'q.\n\n${rawText}`,
      },
    ],
  });

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Savollar topilmadi");
  return JSON.parse(jsonMatch[0]);
}
