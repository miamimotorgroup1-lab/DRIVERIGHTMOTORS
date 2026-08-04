// Seeds the DB from the existing data/cars.json so nothing is lost during
// the migration off the static file. Safe to re-run: upserts by slug.
//
// Run with `npx prisma db seed` (or automatically after `prisma migrate
// dev`) — see the `migrations.seed` command in prisma.config.ts.
//
// This runs as a plain Node/tsx script, not through Next.js's bundler, so
// it can't import lib/prisma.ts — that module is guarded with `server-only`,
// which Next.js no-ops during its own build but which throws for real under
// plain Node. Build a short-lived client here instead.
import { PrismaPg } from "@prisma/adapter-pg";
import carsData from "../data/cars.json";
import { PrismaClient, type CarStatus } from "../generated/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type SeedCar = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  vin: string;
  features: string[];
  description: string;
  images: string[];
  status: CarStatus;
  featured: boolean;
};

const cars = carsData as SeedCar[];

async function main() {
  for (const car of cars) {
    await prisma.car.upsert({
      where: { slug: car.slug },
      create: car,
      update: car,
    });
    console.log(`Upserted ${car.slug}`);
  }
  console.log(`Seeded ${cars.length} cars.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
