import { z } from "zod";

export const courseCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  duration: z.coerce.number().int().min(1).max(60).optional().nullable(),
  price: z.union([z.string(), z.number()]).refine((v) => Number(v) >= 0, "Narx 0 dan kichik bo'lmasin"),
});

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(100),
  courseId: z.string().optional().or(z.literal("")),
  teacherId: z.string().optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
  // Dars jadvali: { days: ["MON","WED","FRI"], startTime: "10:00", endTime: "12:00" }
  scheduleDays: z.array(z.string()).default([]),
  scheduleStartTime: z.string().optional().or(z.literal("")),
  scheduleEndTime: z.string().optional().or(z.literal("")),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type GroupCreateInput = z.infer<typeof groupCreateSchema>;

export const WEEKDAYS = [
  { value: "MON", label: "Du" },
  { value: "TUE", label: "Se" },
  { value: "WED", label: "Ch" },
  { value: "THU", label: "Pa" },
  { value: "FRI", label: "Ju" },
  { value: "SAT", label: "Sh" },
  { value: "SUN", label: "Ya" },
];

export const WEEKDAY_FULL: Record<string, string> = {
  MON: "Dushanba", TUE: "Seshanba", WED: "Chorshanba",
  THU: "Payshanba", FRI: "Juma", SAT: "Shanba", SUN: "Yakshanba",
};
