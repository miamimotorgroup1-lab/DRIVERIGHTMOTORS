"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/lib/motion";

// Building = a stylized silhouette, drawn bottom-up from y=BASE. `deco`
// gives it a tiered Art Deco top (a couple of stacked setbacks) instead of
// a flat roof. Coordinates are hand-placed (not generated) so the skyline
// reads as a deliberate poster illustration — varied rhythm, a couple of
// landmark-height towers, not a random bar chart.
type Building = {
  x: number;
  width: number;
  height: number;
  deco?: boolean;
  stroke: "accent" | "accent-2";
  // Window dot positions, relative to the building's own top-left (0,0).
  // A few (marked `pulse`) get the slow opacity breathe; the rest are
  // static — most of a real skyline's windows don't flicker.
  windows?: { x: number; y: number; pulse?: boolean; delay?: number }[];
};

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 260;
const BASE = 260;

const BUILDINGS_DESKTOP: Building[] = [
  { x: 8, width: 46, height: 88, stroke: "accent-2", windows: w(8, [10, 26, 34]) },
  { x: 66, width: 34, height: 138, stroke: "accent", windows: w(9, [14, 30, 46, 62, 78]) },
  {
    x: 112,
    width: 58,
    height: 108,
    deco: true,
    stroke: "accent-2",
    windows: w(10, [16, 30, 44], true),
  },
  { x: 188, width: 30, height: 178, stroke: "accent", windows: w(8, [20, 40, 60, 80, 100, 120]) },
  { x: 232, width: 50, height: 92, stroke: "accent-2", windows: w(9, [12, 26]) },
  {
    x: 296,
    width: 42,
    height: 148,
    deco: true,
    stroke: "accent",
    windows: w(9, [18, 34, 50, 66], true),
  },
  { x: 352, width: 64, height: 118, stroke: "accent-2", windows: w(11, [14, 30, 46, 62]) },
  {
    x: 442,
    width: 38,
    height: 198,
    deco: true,
    stroke: "accent",
    windows: w(8, [24, 44, 64, 84, 104, 124, 144], true),
  },
  { x: 496, width: 46, height: 96, stroke: "accent-2", windows: w(9, [12, 28, 44]) },
  {
    x: 558,
    width: 54,
    height: 156,
    deco: true,
    stroke: "accent",
    windows: w(10, [18, 36, 54, 72], true),
  },
  { x: 630, width: 40, height: 86, stroke: "accent-2", windows: w(8, [10, 24]) },
  { x: 690, width: 50, height: 126, stroke: "accent", windows: w(9, [14, 30, 46, 62, 78]) },
];

// Simplified subset for narrow viewports — fewer, slightly smaller (see
// the mobile <svg>'s own viewBox), same alternating palette.
const BUILDINGS_MOBILE: Building[] = [
  { x: 10, width: 44, height: 84, stroke: "accent-2", windows: w(9, [12, 28]) },
  {
    x: 70,
    width: 52,
    height: 116,
    deco: true,
    stroke: "accent",
    windows: w(10, [16, 32, 48], true),
  },
  { x: 138, width: 34, height: 150, stroke: "accent-2", windows: w(8, [18, 36, 54, 72]) },
  { x: 186, width: 46, height: 96, stroke: "accent", windows: w(9, [12, 28, 44]) },
  {
    x: 246,
    width: 50,
    height: 134,
    deco: true,
    stroke: "accent-2",
    windows: w(10, [16, 32, 48, 64], true),
  },
  { x: 310, width: 38, height: 90, stroke: "accent", windows: w(8, [12, 26]) },
];

// Small helper so the window-dot arrays above stay declarative instead of
// repeating the same {x,y} shape by hand — still fully deterministic
// (no Math.random) so server and client render identical markup.
function w(
  x: number,
  ys: number[],
  everyOtherPulses = false,
): Building["windows"] {
  return ys.map((y, i) => ({
    x,
    y,
    pulse: everyOtherPulses ? i % 2 === 0 : i === 0,
    delay: (i * 0.7) % 3,
  }));
}

function BuildingShape({ b }: { b: Building }) {
  const top = BASE - b.height;
  const strokeVar = b.stroke === "accent" ? "var(--accent)" : "var(--accent-2)";

  return (
    <g>
      {b.deco ? (
        <>
          <rect
            x={b.x}
            y={top + b.height * 0.22}
            width={b.width}
            height={b.height * 0.78}
            fill="var(--surface)"
            stroke={strokeVar}
            strokeOpacity={0.5}
            strokeWidth={1}
          />
          <rect
            x={b.x + b.width * 0.16}
            y={top + b.height * 0.08}
            width={b.width * 0.68}
            height={b.height * 0.16}
            fill="var(--surface)"
            stroke={strokeVar}
            strokeOpacity={0.5}
            strokeWidth={1}
          />
          <rect
            x={b.x + b.width * 0.36}
            y={top}
            width={b.width * 0.28}
            height={b.height * 0.1}
            fill="var(--surface)"
            stroke={strokeVar}
            strokeOpacity={0.5}
            strokeWidth={1}
          />
        </>
      ) : (
        <rect
          x={b.x}
          y={top}
          width={b.width}
          height={b.height}
          fill="var(--surface)"
          stroke={strokeVar}
          strokeOpacity={0.5}
          strokeWidth={1}
        />
      )}

      {b.windows?.map((win, i) => (
        <circle
          key={i}
          cx={b.x + win.x}
          cy={top + win.y}
          r={2.1}
          fill={strokeVar}
          opacity={win.pulse ? undefined : 0.22}
          className={win.pulse ? "animate-window-pulse" : undefined}
          style={win.pulse ? { animationDelay: `${win.delay}s` } : undefined}
        />
      ))}
    </g>
  );
}

function PalmSilhouette({ x, flip }: { x: number; flip?: boolean }) {
  // A schematic palm, not a botanical one — a curved trunk and five
  // fronds as simple strokes. Deliberately minimal (Vice-poster shorthand
  // for "palm tree"), matching the buildings' clean geometry.
  const scale = flip ? -1 : 1;
  return (
    <g transform={`translate(${x}, 0) scale(${scale}, 1)`} opacity={0.55}>
      <path
        d={`M0,${BASE} C -4,${BASE - 40} 6,${BASE - 70} 2,${BASE - 108}`}
        fill="none"
        stroke="var(--surface)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {[
        [2, BASE - 108, -34, BASE - 128],
        [2, BASE - 108, -18, BASE - 138],
        [2, BASE - 108, 2, BASE - 142],
        [2, BASE - 108, 20, BASE - 134],
        [2, BASE - 108, 32, BASE - 118],
      ].map(([x1, y1, x2, y2], i) => (
        <path
          key={i}
          d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 14} ${x2},${y2}`}
          fill="none"
          stroke="var(--accent-2)"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

const SKY_GRADIENT =
  "linear-gradient(to bottom, #120a24 0%, #2b1240 35%, #5c1f42 68%, #7a3a20 100%)";

export default function CitySkyline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useSafeReducedMotion();

  // Very slow scroll parallax — the skyline drifts a few px slower than
  // the page, "two miles away" behind the car. Capped tiny on purpose.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 18],
  );

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      style={{ y: parallaxY }}
      className="pointer-events-none absolute inset-x-0 top-0 h-[58%] overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    >
      <div className="absolute inset-0" style={{ background: SKY_GRADIENT }} />

      {/* Barely-there horizontal drift so the skyline feels alive, not a
          static poster — a couple px over 20s, imperceptible frame to
          frame. Separate layer from the scroll parallax above so the two
          transforms don't have to be composed by hand. */}
      <motion.div
        className="absolute inset-0 opacity-60"
        animate={shouldReduceMotion ? undefined : { x: [0, 2, 0, -2, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          className="hidden h-full w-full sm:block"
        >
          <PalmSilhouette x={30} />
          {BUILDINGS_DESKTOP.map((b, i) => (
            <BuildingShape key={i} b={b} />
          ))}
          <PalmSilhouette x={770} flip />
        </svg>

        <svg
          viewBox="0 0 400 260"
          preserveAspectRatio="none"
          className="block h-full w-full sm:hidden"
        >
          <PalmSilhouette x={16} />
          {BUILDINGS_MOBILE.map((b, i) => (
            <BuildingShape key={i} b={b} />
          ))}
          <PalmSilhouette x={384} flip />
        </svg>
      </motion.div>
    </motion.div>
  );
}
