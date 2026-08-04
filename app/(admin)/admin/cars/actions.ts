"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { carFormSchema, type CarFormValues } from "@/lib/car-schema";

// Re-verifies the Supabase session on the server for every mutation. proxy.ts
// (lib/supabase/middleware.ts) already gates /admin/:path* optimistically,
// but Server Actions are reachable by direct POST regardless of which page
// rendered them — see the Next.js Data Security guide — so every action in
// this file calls this first. Never trust the client.
async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/admin/login");
  }
}

// Public routes that read Car data and need to reflect a write immediately.
function revalidatePublicPaths(slugs: Array<string | undefined>) {
  revalidatePath("/");
  revalidatePath("/inventory");
  for (const slug of new Set(slugs.filter(Boolean) as string[])) {
    revalidatePath(`/inventory/${slug}`);
  }
}

export type CarFieldErrors = Partial<Record<keyof CarFormValues, string>>;

export type CarActionResult =
  | { success: true; slug: string }
  | { success: false; error: string; fieldErrors?: CarFieldErrors };

function flattenFieldErrors(
  error: ReturnType<typeof carFormSchema.safeParse>["error"],
): CarFieldErrors | undefined {
  if (!error) return undefined;
  const flat = error.flatten().fieldErrors;
  const fieldErrors: CarFieldErrors = {};
  for (const key of Object.keys(flat) as (keyof CarFormValues)[]) {
    const message = flat[key]?.[0];
    if (message) fieldErrors[key] = message;
  }
  return fieldErrors;
}

// Distinguishes "slug already taken" (a field-level, user-fixable problem)
// from any other database error.
function isSlugConflict(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    Array.isArray((err.meta as { target?: unknown })?.target) &&
    (err.meta?.target as string[]).includes("slug")
  );
}

export async function createCar(
  input: CarFormValues,
): Promise<CarActionResult> {
  await requireAdmin();

  const parsed = carFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form and try again.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  try {
    const car = await prisma.car.create({
      data: { id: randomUUID(), ...parsed.data },
    });
    revalidatePublicPaths([car.slug]);
    return { success: true, slug: car.slug };
  } catch (err) {
    if (isSlugConflict(err)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: "Already in use" },
      };
    }
    console.error("createCar failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateCar(
  id: string,
  input: CarFormValues,
): Promise<CarActionResult> {
  await requireAdmin();

  const parsed = carFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form and try again.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  try {
    const existing = await prisma.car.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      return { success: false, error: "Vehicle not found." };
    }

    const car = await prisma.car.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePublicPaths([existing.slug, car.slug]);
    return { success: true, slug: car.slug };
  } catch (err) {
    if (isSlugConflict(err)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: "Already in use" },
      };
    }
    console.error("updateCar failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteCar(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  try {
    const car = await prisma.car.delete({ where: { id } });
    revalidatePublicPaths([car.slug]);
    return { success: true };
  } catch (err) {
    console.error("deleteCar failed:", err);
    return { success: false, error: "Unable to delete vehicle. Please try again." };
  }
}

// Live uniqueness check used by CarForm while the slug field is edited.
// excludeId lets an edit page check without tripping over the car's own row.
export async function checkSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  await requireAdmin();

  if (!slug) return true;
  const existing = await prisma.car.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !existing || existing.id === excludeId;
}
