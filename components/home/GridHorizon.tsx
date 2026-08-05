"use client";

import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/motion";

// Low-contrast synthwave floor — hero background only. Deliberately a flat
// grid + fade mask rather than a literal 3D perspective (cheaper, safer,
// still reads as "floor extending to the horizon"). The only motion is a
// slow, seamless transform: translateY loop — pure transform, no
// background-position repaints.
export default function GridHorizon() {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden [mask-image:linear-gradient(to_top,black,transparent_85%)]"
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[200%] opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, var(--accent-2) 0 1px, transparent 1px 56px), repeating-linear-gradient(to top, var(--accent) 0 1px, transparent 1px 40px)",
          backgroundSize: "56px 40px",
        }}
        animate={shouldReduceMotion ? undefined : { y: [0, -40] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
