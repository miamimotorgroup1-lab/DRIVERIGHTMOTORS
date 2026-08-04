"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CarFilters } from "@/lib/inventory";
import { CANVAS, GUTTER } from "@/lib/layout";

export type SortOption =
  | "year-newest"
  | "price-asc"
  | "price-desc"
  | "mileage-lowest";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "year-newest", label: "Year: Newest" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "mileage-lowest", label: "Mileage: Lowest" },
];

type FilterBarProps = {
  makes: string[];
  bodyTypes: string[];
  filters: CarFilters;
  onChange: (patch: Partial<CarFilters>) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeCount: number;
  onClearAll: () => void;
};

const FIELD_CLASS =
  "border-b border-hairline bg-transparent py-2 text-sm text-text placeholder:text-muted focus:border-accent";

const CLEAR_PILL_CLASS =
  "inline-flex shrink-0 items-center gap-1 rounded-pill border border-hairline px-3 py-1.5 text-xs text-muted transition-colors duration-300 hover:border-accent hover:text-text";

export default function FilterBar({
  makes,
  bodyTypes,
  filters,
  onChange,
  sort,
  onSortChange,
  activeCount,
  onClearAll,
}: FilterBarProps) {
  const [query, setQuery] = useState(filters.query ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      onChange({ query: query.trim() || undefined });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="sticky top-20 z-30 border-b border-hairline bg-surface">
      <div className={`${CANVAS} ${GUTTER} py-4`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-[220px] flex-1 items-center gap-2">
            <Search size={16} className="shrink-0 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search make, model, year…"
              className={`w-full ${FIELD_CLASS}`}
            />
          </div>

          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as SortOption)
            }
            aria-label="Sort by"
            className={FIELD_CLASS}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            className="flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-text md:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-accent text-xs font-medium text-bg">
                {activeCount}
              </span>
            )}
          </button>

          <div className="ml-auto hidden items-center gap-4 md:flex">
            {activeCount > 0 && (
              <>
                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                  {activeCount} active
                </span>
                <button type="button" onClick={onClearAll} className={CLEAR_PILL_CLASS}>
                  Clear all
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        </div>

        <div
          className={`flex-col gap-4 sm:flex-row sm:flex-wrap md:mt-4 ${
            mobileOpen ? "mt-4 flex" : "hidden"
          } md:flex`}
        >
          <select
            value={filters.make ?? ""}
            onChange={(event) =>
              onChange({ make: event.target.value || undefined })
            }
            aria-label="Make"
            className={FIELD_CLASS}
          >
            <option value="">All makes</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>

          <select
            value={filters.bodyType ?? ""}
            onChange={(event) =>
              onChange({ bodyType: event.target.value || undefined })
            }
            aria-label="Body type"
            className={FIELD_CLASS}
          >
            <option value="">All body types</option>
            {bodyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min $"
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                onChange({
                  minPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              aria-label="Minimum price"
              className={`w-24 ${FIELD_CLASS}`}
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max $"
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                onChange({
                  maxPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              aria-label="Maximum price"
              className={`w-24 ${FIELD_CLASS}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="From year"
              value={filters.minYear ?? ""}
              onChange={(event) =>
                onChange({
                  minYear: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              aria-label="From year"
              className={`w-24 ${FIELD_CLASS}`}
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="To year"
              value={filters.maxYear ?? ""}
              onChange={(event) =>
                onChange({
                  maxYear: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              aria-label="To year"
              className={`w-24 ${FIELD_CLASS}`}
            />
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className={`${CLEAR_PILL_CLASS} self-start md:hidden`}
            >
              Clear all ({activeCount})
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
