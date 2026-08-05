"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import LeadTrigger from "@/components/ui/LeadTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import { EASE, useSafeReducedMotion } from "@/lib/motion";

const EYEBROW = "text-xs uppercase tracking-[0.2em] text-muted";
const TEXT_LINK =
  "group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-text";

type HeroHeadlineProps = {
  // Entrance is withheld (words stay masked, copy/CTAs stay hidden) until
  // this flips true — driven by ShowroomIntro's onDone via HomeHero, so a
  // first-time visitor sees the words mask up only after dismissing the
  // intro, not already-settled behind it.
  animate: boolean;
};

function MaskWord({
  children,
  delay,
  chrome,
  animate,
  reduceMotion,
}: {
  children: ReactNode;
  delay: number;
  chrome?: boolean;
  animate: boolean;
  reduceMotion: boolean;
}) {
  return (
    <span className="inline-block overflow-hidden pb-1 align-bottom">
      <motion.span
        className={`inline-block ${chrome ? "text-chrome" : ""}`}
        initial={{ y: reduceMotion ? 0 : "110%", opacity: reduceMotion ? 0 : 1 }}
        animate={
          animate
            ? { y: 0, opacity: 1 }
            : { y: reduceMotion ? 0 : "110%", opacity: reduceMotion ? 0 : 1 }
        }
        transition={{
          duration: reduceMotion ? 0.3 : 0.8,
          delay: reduceMotion ? 0 : delay,
          ease: EASE,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function HeroHeadline({ animate }: HeroHeadlineProps) {
  const reduceMotion = useSafeReducedMotion();
  // Under reduced motion, drop the y-offset/stagger entirely and just fade
  // in quickly, once — same treatment Reveal.tsx gives every other section.
  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: animate
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: reduceMotion ? 0 : 12 },
    transition: {
      duration: reduceMotion ? 0.3 : 0.6,
      delay: reduceMotion ? 0 : delay,
      ease: EASE,
    },
  });

  return (
    <div className="relative z-10 w-full lg:w-7/12">
      <motion.p className={EYEBROW} {...fadeIn(0.1)}>
        Drive Right Motors — Pre-owned
      </motion.p>

      <h1 className="mt-8 font-display text-display-hero font-semibold text-text">
        <div className="flex flex-wrap gap-x-4">
          <MaskWord delay={0.22} animate={animate} reduceMotion={reduceMotion}>
            Find
          </MaskWord>
          <MaskWord delay={0.28} animate={animate} reduceMotion={reduceMotion}>
            the
          </MaskWord>
          <MaskWord
            delay={0.34}
            chrome
            animate={animate}
            reduceMotion={reduceMotion}
          >
            one
          </MaskWord>
        </div>
        <div className="flex flex-wrap gap-x-4">
          <MaskWord delay={0.4} animate={animate} reduceMotion={reduceMotion}>
            you&apos;ll
          </MaskWord>
          <MaskWord delay={0.46} animate={animate} reduceMotion={reduceMotion}>
            actually
          </MaskWord>
        </div>
        <div className="flex flex-wrap gap-x-4">
          <MaskWord delay={0.52} animate={animate} reduceMotion={reduceMotion}>
            keep.
          </MaskWord>
        </div>
      </h1>

      <motion.div
        className="mt-8 h-px w-24 origin-left bg-gradient-to-r from-accent to-accent-2"
        initial={{ scaleX: reduceMotion ? 1 : 0, opacity: reduceMotion ? 0 : 1 }}
        animate={
          animate
            ? { scaleX: 1, opacity: 1 }
            : { scaleX: reduceMotion ? 1 : 0, opacity: reduceMotion ? 0 : 1 }
        }
        transition={{
          duration: reduceMotion ? 0.3 : 0.7,
          delay: reduceMotion ? 0 : 0.58,
          ease: EASE,
        }}
      />

      <motion.p className="mt-8 max-w-sm text-base text-muted" {...fadeIn(0.7)}>
        Hand-picked, inspected, and priced honestly — no games.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-wrap items-center gap-10"
        {...fadeIn(0.74)}
      >
        <MagneticButton href="/inventory" variant="accent">
          Browse inventory
          <ArrowRight size={16} />
        </MagneticButton>
        <LeadTrigger mode="test-drive" className={TEXT_LINK}>
          Book a test drive
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </LeadTrigger>
      </motion.div>
    </div>
  );
}
