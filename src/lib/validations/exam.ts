import { z } from "zod";

// Variant: { id: "A", text: "...", isCorrect: true }
export const optionSchema = z.object({
  id: z.string().min(1).max(5),
  text: z.string().min(1, "Variant matni bo'sh bo'lmasin"),
  isCorrect: z.boolean().default(false),
});

export const questionCreateSchema = z.object({
  subjectId: z.string().min(1, "Fan tanlash shart"),
  topicId: z.string().optional().or(z.literal("")),
  text: z.string().min(5, "Savol matni 5+ belgi bo'lsin"),
  imageUrl: z.string().optional().or(z.literal("")),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT"]).default("SINGLE_CHOICE"),
  difficulty: z.coerce.number().int().min(1).max(5).default(1),
  options: z.array(optionSchema).min(2, "Kamida 2 ta variant kerak"),
  explanation: z.string().optional().or(z.literal("")),
});

export const questionUpdateSchema = questionCreateSchema.partial();

export const examCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional().or(z.literal("")),
  durationMin: z.coerce.number().int().min(1).max(600).default(60),
  totalScore: z.coerce.number().int().min(1).default(100),
  isPublished: z.boolean().default(false),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  showResults: z.boolean().default(true),
  questionIds: z.array(z.string()).default([]),
});

export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type ExamCreateInput = z.infer<typeof examCreateSchema>;

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Bitta to'g'ri javob",
  MULTIPLE_CHOICE: "Ko'p javobli",
  TRUE_FALSE: "To'g'ri / Noto'g'ri",
  SHORT_TEXT: "Qisqa matn",
};

export const DIFFICULTY_LABELS: Record<number, { label: string; cls: string }> = {
  1: { label: "Juda oson", cls: "bg-green-100 text-green-700" },
  2: { label: "Oson", cls: "bg-emerald-100 text-emerald-700" },
  3: { label: "O'rta", cls: "bg-yellow-100 text-yellow-700" },
  4: { label: "Qiyin", cls: "bg-orange-100 text-orange-700" },
  5: { label: "Juda qiyin", cls: "bg-red-100 text-red-700" },
};
