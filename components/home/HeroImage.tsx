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
        className="relative h-full w-full overflow-hidden border border-hairline"
      >
        <CarImage
          src={car?.images[0] ?? ""}
          alt={title}
          fallbackLabel={title}
          hasImage={hasImage}
          sizes="(min-width: 1024px) 46vw, 90vw"
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  );
}
