"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import CarImage from "@/components/ui/CarImage";
import type { Car } from "@/lib/inventory";
import { EASE, useSafeReducedMotion } from "@/lib/motion";
import CitySkyline from "./CitySkyline";
import GridHorizon from "./GridHorizon";

const ROTATE_MS = 5000;

type HeroShowcaseProps = {
  cars: Car[];
  hasImageBySlug: Record<string, boolean>;
  // Same entrance gate as HeroHeadline — see HomeHero.
  animate: boolean;
};

export default function HeroShowcase({
  cars,
  hasImageBySlug,
  animate,
}: HeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useSafeReducedMotion();
  const hasMultiple = cars.length > 1;

  useEffect(() => {
    if (!hasMultiple || paused || shouldReduceMotion) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % cars.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [hasMultiple, paused, shouldReduceMotion, cars.length]);

  const car = cars[index];
  if (!car) return null;

  const title = `${car.year} ${car.make} ${car.model}`;

  return (
    <motion.div
      className="relative aspect-[4/5] w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={
        animate
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: shouldReduceMotion ? 0 : 24 }
      }
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.9,
        delay: shouldReduceMotion ? 0 : 0.55,
        ease: EASE,
      }}
    >
      {/* Back-to-front: sky+skyline, then the car spotlight glow, then the
          grid horizon, then the car itself. The skyline sits in the upper
          portion and fades out before the grid begins, so the two read as
          one continuous backdrop rather than two stacked rectangles. */}
      <CitySkyline />

      {/* Car spotlight — low behind the car. One of this page's two
          reserved sunset-gradient moments (the other is ShowroomIntro). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-10%] bottom-[8%] h-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--sunset-2), var(--sunset-1) 55%, transparent 75%)",
        }}
      />

      <GridHorizon />

      {/* Ghosted neon wordmark of the make, behind the car. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={car.make}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.07 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.2 : 0.8, ease: EASE }}
            className="select-none whitespace-nowrap font-display text-[16vw] font-bold uppercase tracking-tight text-accent-2 lg:text-[9vw]"
          >
            {car.make}
          </motion.span>
        </AnimatePresence>
      </div>

      <Link
        href={`/inventory/${car.slug}`}
        className="relative block h-full w-full overflow-hidden border border-hairline"
      >
        <AnimatePresence>
          <motion.div
            key={car.slug}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.9, ease: EASE }}
          >
            <CarImage
              src={car.images[0] ?? ""}
              alt={title}
              fallbackLabel={title}
              hasImage={hasImageBySlug[car.slug] ?? false}
              sizes="(min-width: 1024px) 46vw, 90vw"
              className="object-contain brightness-95 contrast-105 saturate-90"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Same scrim treatment as the previous single-car hero: darkest
            at the left edge (where it meets the headline) fading clear
            toward the right, plus a light top darken. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/20 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-transparent"
        />

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent-2 sm:text-xs">
            <p>
              {car.year} · {car.model}
            </p>
            <p className="mt-1 text-muted">
              ${car.price.toLocaleString()} · {car.mileage.toLocaleString()} mi
            </p>
          </div>
          {hasMultiple && (
            <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-2 sm:text-xs">
              {String(index + 1).padStart(2, "0")}/{String(cars.length).padStart(2, "0")}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
