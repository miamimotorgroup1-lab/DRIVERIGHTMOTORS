"use client";

import { useMemo, useState } from "react";
import FilterBar, { type SortOption } from "@/components/ui/FilterBar";
import CarCard from "@/components/ui/CarCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import { filterCars, type Car, type CarFilters } from "@/lib/inventory";
import { CANVAS, GUTTER } from "@/lib/layout";

type InventoryGridProps = {
  cars: Car[];
  hasImageBySlug: Record<string, boolean>;
  makes: string[];
  bodyTypes: string[];
};

const EMPTY_FILTERS: CarFilters = {};

const SORT_COMPARATORS: Record<SortOption, (a: Car, b: Car) => number> = {
  "year-newest": (a, b) => b.year - a.year,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "mileage-lowest": (a, b) => a.mileage - b.mileage,
};

export default function InventoryGrid({
  cars,
  hasImageBySlug,
  makes,
  bodyTypes,
}: InventoryGridProps) {
  const [filters, setFilters] = useState<CarFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("year-newest");
  const [resetKey, setResetKey] = useState(0);

  const activeCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== "",
  ).length;

  const visibleCars = useMemo(() => {
    const filtered = filterCars(cars, filters);
    const sorted = [...filtered].sort(SORT_COMPARATORS[sort]);
    const available = sorted.filter((car) => car.status !== "sold");
    const sold = sorted.filter((car) => car.status === "sold");
    return [...available, ...sold];
  }, [cars, filters, sort]);

  function handleFilterChange(patch: Partial<CarFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleClearAll() {
    setFilters(EMPTY_FILTERS);
    setResetKey((prev) => prev + 1);
  }

  return (
    <>
      <FilterBar
        key={resetKey}
        makes={makes}
        bodyTypes={bodyTypes}
        filters={filters}
        onChange={handleFilterChange}
        sort={sort}
        onSortChange={setSort}
        activeCount={activeCount}
        onClearAll={handleClearAll}
      />

      <section className="py-16 md:py-20">
        {visibleCars.length === 0 ? (
          <EmptyState onClearAll={handleClearAll} />
        ) : (
          <Reveal
            stagger={0.06}
            className={`grid ${CANVAS} ${GUTTER} grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3`}
          >
            {visibleCars.map((car) => (
              <CarCard
                key={car.slug}
                car={car}
                hasImage={hasImageBySlug[car.slug] ?? false}
                fluid
              />
            ))}
          </Reveal>
        )}
      </section>
    </>
  );
}

function EmptyState({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div className={`${CANVAS} ${GUTTER} py-24 text-center`}>
      <p className="font-display text-display-sm font-semibold text-text">
        No cars match those filters.
      </p>
      <p className="mt-4 text-sm text-muted">
        Try widening your search, or clear everything and start over.
      </p>
      <MagneticButton onClick={onClearAll} variant="accent" className="mt-8">
        Clear all filters
      </MagneticButton>
    </div>
  );
}
