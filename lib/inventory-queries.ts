import "server-only";

import { prisma } from "@/lib/prisma";
import type { Car } from "@/lib/inventory";

// Selects exactly the fields of the `Car` type (i.e. everything except
// createdAt/updatedAt), so query results are already shaped like `Car` with
// no separate mapping step.
const CAR_SELECT = {
  id: true,
  slug: true,
  make: true,
  model: true,
  year: true,
  price: true,
  mileage: true,
  bodyType: true,
  transmission: true,
  drivetrain: true,
  fuelType: true,
  exteriorColor: true,
  interiorColor: true,
  engine: true,
  vin: true,
  features: true,
  description: true,
  images: true,
  status: true,
  featured: true,
} as const;

// Ordering by creation order reproduces the original data/cars.json array
// order, since the seed script upserts rows in that same order.
const ORIGINAL_ORDER = { createdAt: "asc" } as const;

export async function getAllCars(): Promise<Car[]> {
  return prisma.car.findMany({
    select: CAR_SELECT,
    orderBy: ORIGINAL_ORDER,
  });
}

export async function getFeaturedCars(): Promise<Car[]> {
  return prisma.car.findMany({
    where: { featured: true },
    select: CAR_SELECT,
    orderBy: ORIGINAL_ORDER,
  });
}

export async function getCarBySlug(slug: string): Promise<Car | undefined> {
  const car = await prisma.car.findUnique({
    where: { slug },
    select: CAR_SELECT,
  });
  return car ?? undefined;
}

export async function getMakes(): Promise<string[]> {
  const cars = await prisma.car.findMany({ select: { make: true } });
  return Array.from(new Set(cars.map((car) => car.make))).sort();
}

export async function getBodyTypes(): Promise<string[]> {
  const cars = await prisma.car.findMany({ select: { bodyType: true } });
  return Array.from(new Set(cars.map((car) => car.bodyType))).sort();
}
