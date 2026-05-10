import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ExamAnswerForAI {
  question: string;
  options?: { id: string; text: string }[];
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  subject: string;
  topic?: string;
}

export interface AIAnalysisResult {
  overallScore: number;
  weakTopics: { topic: string; reason: string }[];
  strongTopics: string[];
  recommendations: {
    universities: { name: string; faculty: string; matchScore: number; reason: string }[];
    studyPlan: string;
  };
  questionExplanations: {
    questionIndex: number;
    correctAnswer: string;
    explanation: string;
    relatedTopic: string;
  }[];
}

/**
 * O'quvchi imtihon natijasini Claude AI orqali tahlil qiladi.
 * - Zaif mavzularni aniqlaydi
 * - Xato javoblarni tushuntirib beradi
 * - Mos universitet va fakultetlarni tavsiya qiladi
 */
export async function analyzeExamWithAI(params: {
  studentName: string;
  totalQuestions: number;
  correctCount: number;
  answers: ExamAnswerForAI[];
  targetUniversity?: string;
  targetFaculty?: string;
}): Promise<AIAnalysisResult> {
  const prompt = `Sen O'zbekistondagi DTM (Davlat Test Markazi) imtihonlariga tayyorlovchi tajribali pedagogsan.
O'quvchining test natijasini tahlil qil va quyidagi formatda JSON qaytaring:

O'quvchi: ${params.studentName}
Maqsad: ${params.targetUniversity ?? "Aniq emas"} — ${params.targetFaculty ?? "Aniq emas"}
Jami savollar: ${params.totalQuestions}
To'g'ri javoblar: ${params.correctCount}

Savollar va javoblar:
${params.answers
  .map(
    (a, i) => `
${i + 1}. [${a.subject}${a.topic ? " / " + a.topic : ""}]
Savol: ${a.question}
${a.options ? "Variantlar: " + a.options.map((o) => `${o.id}) ${o.text}`).join("; ") : ""}
O'quvchi javobi: ${a.studentAnswer}
To'g'ri javob: ${a.correctAnswer}
Holat: ${a.isCorrect ? "TO'G'RI" : "XATO"}`
  )
  .join("\n")}

Quyidagi JSON formatida javob qaytar (qo'shimcha matn yozma, faqat JSON):
{
  "overallScore": <0-100>,
  "weakTopics": [{"topic": "...", "reason": "..."}],
  "strongTopics": ["..."],
  "recommendations": {
    "universities": [
      {"name": "...", "faculty": "...", "matchScore": <0-100>, "reason": "..."}
    ],
    "studyPlan": "Qaysi mavzularni qancha vaqt takrorlash kerakligi"
  },
  "questionExplanations": [
    {
      "questionIndex": <0-based>,
      "correctAnswer": "...",
      "explanation": "Nima uchun bu javob to'g'ri ekanligi batafsil",
      "relatedTopic": "..."
    }
  ]
}

MUHIM:
- Faqat xato javoblar uchun questionExplanations qaytar
- O'zbek tilida yoz
- Universitet tavsiyasi DTM ballari va o'quvchi natijasiga mos bo'lsin
- Tushuntirishlar aniq va pedagogik bo'lsin`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  // JSON ni ajratib olish (Claude ba'zan ```json bilan o'rab beradi)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI javobida JSON topilmadi");

  return JSON.parse(jsonMatch[0]) as AIAnalysisResult;
}

/**
 * Excel/Word'dan import qilingan savol matnini tozalaydi va parse qiladi
 */
export async function parseQuestionsFromText(rawText: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Quyidagi matndan test savollarni JSON arrayga aylantir. Har bir savol uchun:
{ "text": "savol matni", "options": [{"id":"A","text":"...","isCorrect":true|false}], "explanation": "ixtiyoriy" }

Formula bo'lsa LaTeX ($...$) ko'rinishida saqla.

Matn:
${rawText}

Faqat JSON array qaytar.`,
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
