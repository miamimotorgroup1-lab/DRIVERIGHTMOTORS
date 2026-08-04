"use client";

import { motion } from "framer-motion";
import { EASE, useSafeReducedMotion } from "@/lib/motion";

export default function ScrollCue() {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <div className="flex items-center gap-3 text-muted">
      <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
      <span className="relative h-10 w-px overflow-hidden bg-hairline">
        {!shouldReduceMotion && (
          <motion.span
            className="absolute inset-x-0 top-0 h-3 bg-accent"
            animate={{ y: [-12, 40] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: EASE }}
          />
        )}
      </span>
    </div>
  );
}
