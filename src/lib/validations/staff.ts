import { z } from "zod";

export const staffCreateSchema = z.object({
  name: z.string().min(3, "Ism 3+ harf").max(100),
  email: z.string().email("Email noto'g'ri").optional().or(z.literal("")),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Telefon noto'g'ri").optional().or(z.literal("")),
  password: z.string().min(6, "Parol 6+ belgi").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "TENANT_OWNER"]).default("ADMIN"),
}).refine((d) => !!d.email || !!d.phone, { message: "Email yoki telefon kerak", path: ["email"] });

export const staffUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\+?\d{9,15}$/).optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "TENANT_OWNER"]).optional(),
  isActive: z.boolean().optional(),
});

export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
