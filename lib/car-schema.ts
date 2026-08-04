import { z } from "zod";

// Shared, client-safe schema for the admin Car create/edit form. Imported by
// both the client-side CarForm (components/admin/CarForm.tsx) for immediate
// field feedback and the Server Actions (app/(admin)/admin/cars/actions.ts)
// which re-validate before ever touching the DB — never trust the client.

export const CAR_STATUSES = ["available", "pending", "sold"] as const;
export type CarStatusValue = (typeof CAR_STATUSES)[number];

const CURRENT_YEAR = new Date().getFullYear();

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const carFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers, and hyphens only"),
  make: z.string().trim().min(1, "Make is required"),
  model: z.string().trim().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int("Enter a whole number")
    .min(1900, "Enter a valid year")
    .max(CURRENT_YEAR + 1, "Enter a valid year"),
  price: z.coerce.number().int("Enter a whole number").min(0, "Enter a valid price"),
  mileage: z.coerce
    .number()
    .int("Enter a whole number")
    .min(0, "Enter a valid mileage"),
  bodyType: z.string().trim().min(1, "Body type is required"),
  transmission: z.string().trim().min(1, "Transmission is required"),
  drivetrain: z.string().trim().min(1, "Drivetrain is required"),
  fuelType: z.string().trim().min(1, "Fuel type is required"),
  exteriorColor: z.string().trim().min(1, "Exterior color is required"),
  interiorColor: z.string().trim().min(1, "Interior color is required"),
  engine: z.string().trim().min(1, "Engine is required"),
  vin: z.string().trim().min(1, "VIN is required"),
  features: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().min(1, "Description is required"),
  // Ordered list of image URLs. Photo upload is a later phase — for now
  // these are plain strings (either the existing local /cars/... paths or
  // full https:// URLs), so we only require them to be non-empty rather
  // than a strict URL format.
  images: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(CAR_STATUSES),
  featured: z.boolean().default(false),
});

export type CarFormValues = z.infer<typeof carFormSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeSlugSeed(
  year: number | string,
  make: string,
  model: string,
): string {
  return slugify(`${year} ${make} ${model}`);
}
