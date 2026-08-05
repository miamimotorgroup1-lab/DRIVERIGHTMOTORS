"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Car } from "@/lib/inventory";
import CarImage from "@/components/ui/CarImage";

type HeroImageProps = {
  car?: Car;
  hasImage: boolean;
};

export default function HeroImage({ car, hasImage }: HeroImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 120],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 1.08],
  );

  const title = car
    ? `${car.year} ${car.make} ${car.model}`
    : "Featured vehicle";

  return (
    <div ref={ref} className="relative aspect-[4/5] w-full">
      <motion.div
        style={{ y, scale }}
        className="relative h-full w-full overflow-hidden border border-hairline bg-elevated"
      >
        {/* object-contain (not cover) so real, imperfect lot photos never
            get cropped into the car — a landscape photo letterboxes inside
            this portrait frame instead of losing its front/rear ends. The
            near-black letterbox reads as a cinematic frame, not empty
            space, once the scrims below tie it into the page background. */}
        <CarImage
          src={car?.images[0] ?? ""}
          alt={title}
          fallbackLabel={title}
          hasImage={hasImage}
          sizes="(min-width: 1024px) 46vw, 90vw"
          className="object-contain brightness-95 contrast-105 saturate-90"
          priority
        />

        {/* Scrim: darkest at the left edge (where the image meets the
            headline) fading clear toward the right, plus a light top
            darken so busy sky/signage recedes. Static (no motion), so
            nothing here needs a reduced-motion branch. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/20 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-transparent"
        />
      </motion.div>
    </div>
  );
}
