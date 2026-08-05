"use client";

import { motion, type Variants } from "framer-motion";
import { Children, type ReactNode } from "react";
import { DURATION, EASE, useSafeReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  duration = DURATION.base,
  y = 28,
  stagger = 0,
  once = true,
}: RevealProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const offset = shouldReduceMotion ? 0 : y;
  const animDuration = shouldReduceMotion ? Math.min(duration, 0.4) : duration;

  const item: Variants = {
    hidden: { opacity: 0, y: offset },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: animDuration, ease: EASE },
    },
  };

  if (stagger > 0) {
    const container: Variants = {
      hidden: {},
      visible: {
        transition: { delayChildren: delay, staggerChildren: stagger },
      },
    };

    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-100px" }}
        variants={container}
      >
        {Children.map(children, (child, index) => (
          <motion.div key={index} variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={item}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
