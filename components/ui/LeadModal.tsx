"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { EASE, useSafeReducedMotion } from "@/lib/motion";
import { leadFormSchema, type LeadCar, type LeadMode } from "@/lib/lead";
import MagneticButton from "./MagneticButton";

type LeadModalProps = {
  open: boolean;
  mode: LeadMode;
  car?: LeadCar;
  onClose: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  message: string;
  company: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  preferredDate: "",
  message: "",
  company: "",
};

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<keyof FormState, string>>;

const MODE_LABEL: Record<LeadMode, string> = {
  "test-drive": "Test drive",
  financing: "Financing",
  contact: "Contact",
};

const MODE_COPY: Record<
  LeadMode,
  { title: (car?: LeadCar) => string; subtitle: string }
> = {
  "test-drive": {
    title: (car) =>
      car
        ? `Test drive the ${car.year} ${car.make} ${car.model}`
        : "Book a test drive",
    subtitle: "Tell us when works and we'll confirm a time.",
  },
  financing: {
    title: (car) =>
      car
        ? `Get financing for the ${car.year} ${car.make} ${car.model}`
        : "Get pre-qualified",
    subtitle: "No impact on your credit score to get started.",
  },
  contact: {
    title: () => "Get in touch",
    subtitle: "We'll get back to you within one business day.",
  },
};

const FIELD_BASE =
  "w-full border-b bg-transparent py-2 text-sm text-text placeholder:text-muted";

function fieldClass(hasError: boolean) {
  return `${FIELD_BASE} ${hasError ? "border-red-400/60" : "border-hairline focus:border-accent"}`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}

const FOCUSABLE_SELECTOR =
  'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])';

export default function LeadModal({
  open,
  mode,
  car,
  onClose,
}: LeadModalProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const [previousOpen, setPreviousOpen] = useState(open);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setStatus("idle");
      setServerError(null);
    }
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((node) => !node.hasAttribute("disabled"));
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      mode,
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferredDate: mode === "test-drive" ? form.preferredDate : undefined,
      message: form.message || undefined,
      car,
      company: form.company,
    };

    const result = leadFormSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        preferredDate: fieldErrors.preferredDate?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setServerError(
          data?.error ?? "Something went wrong. Please try again.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const copy = MODE_COPY[mode];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.15 : 0.3, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0 bg-bg/80"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 24,
              scale: shouldReduceMotion ? 1 : 0.98,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 16,
              scale: shouldReduceMotion ? 1 : 0.98,
            }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.45,
              ease: EASE,
            }}
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto border border-hairline bg-surface p-8 sm:p-10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {MODE_LABEL[mode]}
                </p>
                <h2
                  id="lead-modal-title"
                  className="mt-2 font-display text-2xl font-semibold text-text sm:text-3xl"
                >
                  {copy.title(car)}
                </h2>
                {status !== "success" && (
                  <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 text-muted transition-colors duration-300 hover:text-text"
              >
                <X size={20} />
              </button>
            </div>

            {status === "success" ? (
              <div className="mt-10">
                <p className="font-display text-2xl font-semibold text-text">
                  Request sent.
                </p>
                <p className="mt-3 text-sm text-muted">
                  We&apos;ll reach out to {form.email} shortly.
                </p>
                <MagneticButton
                  variant="ghost"
                  onClick={onClose}
                  className="mt-8"
                >
                  Close
                </MagneticButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
                <Field label="Name" error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    autoComplete="name"
                    className={fieldClass(Boolean(errors.name))}
                  />
                </Field>

                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    autoComplete="email"
                    className={fieldClass(Boolean(errors.email))}
                  />
                </Field>

                <Field label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    autoComplete="tel"
                    className={fieldClass(Boolean(errors.phone))}
                  />
                </Field>

                {mode === "test-drive" && (
                  <Field label="Preferred date" error={errors.preferredDate}>
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={(event) =>
                        updateField("preferredDate", event.target.value)
                      }
                      className={fieldClass(Boolean(errors.preferredDate))}
                    />
                  </Field>
                )}

                <Field label="Message" error={errors.message}>
                  <textarea
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    rows={4}
                    className={`${fieldClass(Boolean(errors.message))} resize-none`}
                  />
                </Field>

                <div
                  className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label>
                    Company
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company}
                      onChange={(event) =>
                        updateField("company", event.target.value)
                      }
                    />
                  </label>
                </div>

                {serverError && (
                  <p className="text-sm text-red-400">{serverError}</p>
                )}

                <MagneticButton
                  type="submit"
                  variant="accent"
                  disabled={status === "submitting"}
                  className="w-full justify-center"
                >
                  {status === "submitting" ? "Sending…" : "Send request"}
                </MagneticButton>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
