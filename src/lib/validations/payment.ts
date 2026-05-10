import { z } from "zod";

export const PAYMENT_METHODS = ["CASH", "CARD", "CLICK", "PAYME", "BANK_TRANSFER", "OTHER"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

export const paymentCreateSchema = z.object({
  studentId: z.string().min(1, "O'quvchi tanlash shart"),
  amount: z.union([z.string(), z.number()]).refine(
    (v) => Number(v) > 0,
    "Summa 0 dan katta bo'lsin"
  ),
  method: z.enum(PAYMENT_METHODS).default("CASH"),
  status: z.enum(PAYMENT_STATUSES).default("PAID"),
  forMonth: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM").optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
  paidAt: z.string().optional().or(z.literal("")),
});

export const paymentUpdateSchema = paymentCreateSchema.partial().omit({ studentId: true });

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;

export const METHOD_LABELS: Record<string, string> = {
  CASH: "Naqd",
  CARD: "Karta",
  CLICK: "Click",
  PAYME: "Payme",
  BANK_TRANSFER: "Bank o'tkazma",
  OTHER: "Boshqa",
};

export const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Kutilmoqda", cls: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "To'langan", cls: "bg-green-100 text-green-700" },
  FAILED: { label: "Xato", cls: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Qaytarilgan", cls: "bg-orange-100 text-orange-700" },
};
