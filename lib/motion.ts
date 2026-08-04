import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.5,
  base: 0.65,
  slow: 0.8,
} as const;

/**
 * framer-motion resolves prefers-reduced-motion synchronously on the
 * client's first render, which never matches the server's render (SSR has
 * no matchMedia). Gate on client-mount so hydration always sees "motion
 * enabled" first, then re-renders with the real preference client-side.
 */
export function useSafeReducedMotion(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Client-mount detection has no render-time substitute — it's the one
    // legitimate case for a bare setState-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const preference = useReducedMotion();
  return mounted && Boolean(preference);
}
