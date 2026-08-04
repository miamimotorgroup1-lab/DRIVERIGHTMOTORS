import { z } from "zod";

export const LEAD_MODES = ["test-drive", "financing", "contact"] as const;
export type LeadMode = (typeof LEAD_MODES)[number];

export const leadCarSchema = z.object({
  slug: z.string(),
  year: z.number(),
  make: z.string(),
  model: z.string(),
});
export type LeadCar = z.infer<typeof leadCarSchema>;

export const leadFormSchema = z.object({
  mode: z.enum(LEAD_MODES),
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9()+\-.\s]{7,20}$/, "Enter a valid phone number"),
  preferredDate: z.string().trim().optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Keep it under 2000 characters")
    .optional(),
  car: leadCarSchema.optional(),
  // Honeypot: legitimate submissions always leave this blank.
  company: z.string().optional(),
});
export type LeadFormValues = z.infer<typeof leadFormSchema>;
