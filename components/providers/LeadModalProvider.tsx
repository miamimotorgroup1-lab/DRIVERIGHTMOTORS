"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import LeadModal from "@/components/ui/LeadModal";
import type { LeadCar, LeadMode } from "@/lib/lead";

type LeadModalContextValue = {
  openLead: (mode: LeadMode, car?: LeadCar) => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function useLeadModal(): LeadModalContextValue {
  const context = useContext(LeadModalContext);
  if (!context) {
    throw new Error("useLeadModal must be used within a LeadModalProvider");
  }
  return context;
}

type LeadModalState = {
  open: boolean;
  mode: LeadMode;
  car?: LeadCar;
};

export default function LeadModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<LeadModalState>({
    open: false,
    mode: "contact",
  });

  const openLead = useCallback((mode: LeadMode, car?: LeadCar) => {
    setState({ open: true, mode, car });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ openLead }), [openLead]);

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      <LeadModal
        open={state.open}
        mode={state.mode}
        car={state.car}
        onClose={close}
      />
    </LeadModalContext.Provider>
  );
}
