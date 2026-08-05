"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSafeReducedMotion } from "@/lib/motion";

type CountUpProps = {
  value: string; // e.g. "40+", "100%", "0" — a leading/trailing non-digit run is preserved
  duration?: number;
};

const NUMBER_PATTERN = /^(\D*)(\d+)(\D*)$/;

function zeroed(value: string): string {
  const match = value.match(NUMBER_PATTERN);
  return match ? `${match[1]}0${match[3]}` : value;
}

// Counts up to `value` once scrolled into view. Values that aren't
// "<prefix><digits><suffix>" (nothing here needs that, but just in case)
// render as-is with no animation.
export default function CountUp({ value, duration = 1.4 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useSafeReducedMotion();
  // Only ever holds the ANIMATED path's in-progress value — the
  // reduced-motion / not-yet-in-view cases are derived at render time
  // below, not set here, so this effect never needs a synchronous setState
  // in its body (only inside the rAF callback, which is fine).
  const [animatedDisplay, setAnimatedDisplay] = useState(() => zeroed(value));

  useEffect(() => {
    if (shouldReduceMotion || !inView) return;

    const match = value.match(NUMBER_PATTERN);
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    const target = Number(numStr);
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedDisplay(`${prefix}${Math.round(target * eased)}${suffix}`);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, shouldReduceMotion, value, duration]);

  const match = value.match(NUMBER_PATTERN);
  const display = shouldReduceMotion || !match ? value : animatedDisplay;

  return <span ref={ref}>{display}</span>;
}
