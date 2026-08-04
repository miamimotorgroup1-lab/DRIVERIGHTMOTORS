"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLeadModal } from "@/components/providers/LeadModalProvider";
import { CANVAS, GUTTER } from "@/lib/layout";
import { EASE } from "@/lib/motion";
import MagneticButton from "./MagneticButton";

const NAV_LINKS = [
  { label: "Inventory", href: "/inventory" },
  { label: "Financing", href: "/financing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const { openLead } = useLeadModal();

  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${
          scrolled
            ? "border-hairline bg-surface/90 backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className={`flex h-20 items-center justify-between ${CANVAS} ${GUTTER}`}>
          <Link
            href="/"
            className="font-display text-lg tracking-tight text-text"
          >
            DRIVE RIGHT MOTORS
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors duration-300 hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <MagneticButton
              variant="accent"
              onClick={() => openLead("test-drive")}
            >
              Book test drive
            </MagneticButton>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="relative z-50 flex h-10 w-10 items-center justify-center text-text md:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={open ? "close" : "menu"}
                initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: shouldReduceMotion ? 0 : 45 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.5,
              ease: EASE,
            }}
            className="fixed inset-0 z-40 flex flex-col bg-bg md:hidden"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.2 : 0.6,
                    ease: EASE,
                    delay: shouldReduceMotion ? 0 : 0.1 + index * 0.06,
                  }}
                >
                  <Link
                    href={link.href}
                    className="font-display text-3xl text-text"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.6,
                  ease: EASE,
                  delay: shouldReduceMotion ? 0 : 0.1 + NAV_LINKS.length * 0.06,
                }}
              >
                <MagneticButton
                  variant="accent"
                  onClick={() => {
                    setOpen(false);
                    openLead("test-drive");
                  }}
                >
                  Book test drive
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
