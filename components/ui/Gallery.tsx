"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { EASE, useSafeReducedMotion } from "@/lib/motion";
import CarImage from "./CarImage";

type GalleryProps = {
  images: string[];
  hasImageList: boolean[];
  title: string;
};

export default function Gallery({ images, hasImageList, title }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useSafeReducedMotion();
  const touchStartX = useRef<number | null>(null);

  const hasAnyPhoto = images.length > 0 && hasImageList.some(Boolean);
  const hasMultiple = images.length > 1;

  function goTo(next: number) {
    setIndex((next + images.length) % images.length);
  }

  useEffect(() => {
    if (!hasMultiple) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, hasMultiple]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  if (!hasAnyPhoto) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-elevated">
        <CarImage src="" alt={title} fallbackLabel={title} hasImage={false} />
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-elevated"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: EASE }}
            className="absolute inset-0"
          >
            <CarImage
              src={images[index] ?? ""}
              alt={`${title} — photo ${index + 1}`}
              fallbackLabel={title}
              hasImage={hasImageList[index] ?? false}
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-hairline bg-surface text-text transition-colors duration-300 hover:border-accent"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-hairline bg-surface text-text transition-colors duration-300 hover:border-accent"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-4 flex gap-3">
          {images.map((src, photoIndex) => (
            <button
              key={`${src}-${photoIndex}`}
              type="button"
              onClick={() => goTo(photoIndex)}
              aria-label={`View photo ${photoIndex + 1}`}
              aria-current={photoIndex === index}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden border transition-[border-color,box-shadow] duration-300 ${
                photoIndex === index
                  ? "border-accent-2 shadow-[0_0_0_2px_rgba(34,211,238,0.35)]"
                  : "border-hairline hover:border-muted"
              }`}
            >
              <CarImage
                src={src}
                alt=""
                fallbackLabel={title}
                hasImage={hasImageList[photoIndex] ?? false}
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
