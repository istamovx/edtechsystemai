import { z } from "zod";

export const studentCreateSchema = z.object({
  fullName: z.string().min(3, "F.I.SH 3+ harf bo'lsin").max(100),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Telefon noto'g'ri").optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  passportSeries: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  targetUniversity: z.string().max(100).optional().or(z.literal("")),
  targetFaculty: z.string().max(100).optional().or(z.literal("")),
  cardId: z.string().max(50).optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
  status: z.enum(["LEAD", "ACTIVE", "PAUSED", "GRADUATED", "DROPPED"]).default("ACTIVE"),
  notes: z.string().max(1000).optional().or(z.literal("")),

  // Inline parent creation (parentId bo'lmasa)
  newParentName: z.string().optional().or(z.literal("")),
  newParentPhone: z.string().optional().or(z.literal("")),
  newParentTelegram: z.string().optional().or(z.literal("")),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
