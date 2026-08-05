"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DURATION, EASE, useSafeReducedMotion } from "@/lib/motion";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -16 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : DURATION.base,
          ease: EASE,
        }}
      >
        {/* Fade-through-black + neon sweep, once per navigation. This is a
            child of the key={pathname} element above, so AnimatePresence's
            own remount-on-navigate does the triggering for free — no
            separate pathname-change watcher needed. `initial={false}` on
            the AnimatePresence means this correctly stays off on the very
            first page load and only plays on subsequent navigations.
            Skipped entirely under reduced motion (no flash). */}
        {!shouldReduceMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[90] bg-bg"
            initial={{ opacity: 0.94 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <motion.div
              className="absolute left-0 right-0 top-1/2 h-px origin-left -translate-y-1/2 bg-gradient-to-r from-transparent via-accent-2 to-transparent"
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </motion.div>
        )}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
