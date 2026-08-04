"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";
import { EASE, useSafeReducedMotion } from "@/lib/motion";

const MotionLink = motion.create(Link);

export type MagneticButtonVariant = "accent" | "ghost";

type CommonProps = {
  children: ReactNode;
  variant?: MagneticButtonVariant;
  className?: string;
  strength?: number;
};

type MotionConflictingProps =
  | "className"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd";

type MagneticButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictingProps> & {
    href?: undefined;
  };

type MagneticButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, MotionConflictingProps> & {
    href: string;
  };

export type MagneticButtonProps = MagneticButtonAsButton | MagneticButtonAsLink;

const variantClasses: Record<MagneticButtonVariant, string> = {
  accent: "bg-accent text-bg hover:bg-accent-hover",
  ghost:
    "bg-transparent text-text border border-hairline hover:border-accent hover:text-accent",
};

export default function MagneticButton({
  children,
  variant = "accent",
  className = "",
  strength = 0.3,
  ...props
}: MagneticButtonProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });

  function handleMouseMove(
    event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const baseClass = `inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm font-medium transition-colors duration-300 ${variantClasses[variant]} ${className}`;
  const motionStyle = shouldReduceMotion
    ? undefined
    : { x: springX, y: springY };
  const tapAnimation = shouldReduceMotion ? undefined : { scale: 0.96 };

  if (props.href !== undefined) {
    const { href, ...linkProps } = props as MagneticButtonAsLink;
    return (
      <MotionLink
        href={href}
        className={baseClass}
        style={motionStyle}
        whileTap={tapAnimation}
        transition={{ duration: 0.5, ease: EASE }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...linkProps}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type="button"
      className={baseClass}
      style={motionStyle}
      whileTap={tapAnimation}
      transition={{ duration: 0.5, ease: EASE }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(props as MagneticButtonAsButton)}
    >
      {children}
    </motion.button>
  );
}
