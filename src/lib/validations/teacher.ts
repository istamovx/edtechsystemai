import { z } from "zod";

export const SUBJECTS = [
  "Matematika", "Fizika", "Kimyo", "Biologiya",
  "Ona-tili", "Adabiyot", "Tarix", "Geografiya",
  "Ingliz tili", "Rus tili", "Informatika",
];

export const teacherCreateSchema = z.object({
  fullName: z.string().min(3, "F.I.SH 3+ harf bo'lsin").max(100),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Telefon noto'g'ri").optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  subjects: z.array(z.string()).default([]),
  bio: z.string().max(500).optional().or(z.literal("")),
  isMentor: z.boolean().default(false),
  salaryType: z.enum(["HOURLY", "MONTHLY", "PERCENT"]).default("HOURLY"),
  salaryRate: z.union([z.string(), z.number()]).optional().nullable(),
  bonusPercent: z.union([z.string(), z.number()]).optional().nullable(),
  cardId: z.string().max(50).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "FIRED"]).default("ACTIVE"),
});

export const teacherUpdateSchema = teacherCreateSchema.partial();

export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
export type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>;
