import carsData from "@/data/cars.json";

export type CarStatus = "available" | "sold" | "pending";

export type Car = {
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

export type CarFilters = {
  make?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  query?: string;
};

const cars = carsData as Car[];

export function getAllCars(): Car[] {
  return cars;
}

export function getFeaturedCars(): Car[] {
  return cars.filter((car) => car.featured);
}

export function getCarBySlug(slug: string): Car | undefined {
  return cars.find((car) => car.slug === slug);
}

export function filterCars(cars: Car[], filters: CarFilters): Car[] {
  const query = filters.query?.trim().toLowerCase();

  return cars.filter((car) => {
    if (filters.make && car.make !== filters.make) return false;
    if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
    if (filters.minPrice !== undefined && car.price < filters.minPrice)
      return false;
    if (filters.maxPrice !== undefined && car.price > filters.maxPrice)
      return false;
    if (filters.minYear !== undefined && car.year < filters.minYear)
      return false;
    if (filters.maxYear !== undefined && car.year > filters.maxYear)
      return false;
    if (query) {
      const haystack =
        `${car.year} ${car.make} ${car.model} ${car.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export const makes: string[] = Array.from(
  new Set(cars.map((car) => car.make)),
).sort();

export const bodyTypes: string[] = Array.from(
  new Set(cars.map((car) => car.bodyType)),
).sort();
