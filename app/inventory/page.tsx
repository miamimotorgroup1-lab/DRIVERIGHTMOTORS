import type { Metadata } from "next";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import Reveal from "@/components/ui/Reveal";
import { carImageExists } from "@/lib/car-images";
import { bodyTypes, getAllCars, makes } from "@/lib/inventory";
import { GUTTER } from "@/lib/layout";

const TITLE = "Inventory — Drive Right Motors";
const DESCRIPTION =
  "Browse our full lineup of hand-picked, inspected used vehicles.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

const EYEBROW = "text-xs uppercase tracking-[0.2em] text-muted";

export default function InventoryPage() {
  const cars = getAllCars();
  const hasImageBySlug = Object.fromEntries(
    cars.map((car) => [car.slug, carImageExists(car.images[0] ?? "")]),
  );

  return (
    <>
      <section className={`pb-12 pt-40 md:pt-48 ${GUTTER}`}>
        <Reveal stagger={0.1}>
          <p className={EYEBROW}>Inventory</p>
          <h1 className="mt-6 font-display text-display-xl font-semibold text-text">
            The full lineup.
          </h1>
          <p className="mt-6 max-w-md text-base text-muted">
            Every vehicle on the lot, filterable by make, body style, budget,
            and year.
          </p>
        </Reveal>
      </section>

      <InventoryGrid
        cars={cars}
        hasImageBySlug={hasImageBySlug}
        makes={makes}
        bodyTypes={bodyTypes}
      />
    </>
  );
}
