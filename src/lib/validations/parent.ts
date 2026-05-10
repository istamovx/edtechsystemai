import { z } from "zod";

export const parentCreateSchema = z.object({
  fullName: z.string().min(3, "F.I.SH 3+ harf bo'lsin").max(100),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Telefon noto'g'ri"),
  telegramId: z.string().optional().or(z.literal("")),
});

export const parentUpdateSchema = parentCreateSchema.partial();

export type ParentCreateInput = z.infer<typeof parentCreateSchema>;
