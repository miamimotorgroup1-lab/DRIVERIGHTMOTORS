"use client";

import type { ReactNode } from "react";
import { useLeadModal } from "@/components/providers/LeadModalProvider";
import type { LeadCar, LeadMode } from "@/lib/lead";
import MagneticButton, { type MagneticButtonVariant } from "./MagneticButton";

type LeadTriggerProps = {
  mode: LeadMode;
  car?: LeadCar;
  variant?: MagneticButtonVariant;
  className?: string;
  children: ReactNode;
};

export default function LeadTrigger({
  mode,
  car,
  variant,
  className,
  children,
}: LeadTriggerProps) {
  const { openLead } = useLeadModal();
  const handleClick = () => openLead(mode, car);

  if (variant) {
    return (
      <MagneticButton variant={variant} className={className} onClick={handleClick}>
        {children}
      </MagneticButton>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
