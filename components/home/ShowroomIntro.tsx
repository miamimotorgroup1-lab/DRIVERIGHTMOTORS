"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import { EASE, useSafeReducedMotion } from "@/lib/motion";

const SESSION_FLAG = "drm-showroom-seen";
const WORDMARK = "DRIVE RIGHT MOTORS";

type ShowroomIntroProps = {
  // Fired once — either immediately (intro was already seen this session,
  // nothing ever rendered) or after the exit wipe finishes (intro was
  // shown and just got dismissed). The homepage hero withholds its own
  // entrance animation until this fires, so "click Enter → hero animates
  // in" actually happens instead of the hero having silently already
  // settled behind the overlay.
  onDone: () => void;
};

function readSeenFlag(): boolean {
  try {
    return sessionStorage.getItem(SESSION_FLAG) === "1";
  } catch {
    // Storage unavailable (private browsing, disabled storage, etc.) —
    // fail open to "unseen" rather than crash; worst case the intro plays
    // every visit for that user.
    return false;
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    // Same as above — non-fatal if this can't persist.
  }
}

export default function ShowroomIntro({ onDone }: ShowroomIntroProps) {
  // `decided` gates first paint so the (SSR-unsafe) sessionStorage check
  // never causes a hydration mismatch: the layout effect below runs
  // synchronously before the browser paints, so a "seen" visitor never
  // actually sees this overlay flash on screen.
  const [decided, setDecided] = useState(false);
  const [visible, setVisible] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  // The safe wrapper, not framer-motion's raw hook: this component renders
  // an entirely different subtree (FullIntro vs ReducedMotionIntro) based
  // on this flag, so a synchronous-on-first-client-render value here would
  // mean a reduced-motion visitor's client HTML never matches the server's
  // — a hydration mismatch (React error #418), not just a smoother
  // animation choice.
  const shouldReduceMotion = useSafeReducedMotion();

  useLayoutEffect(() => {
    if (readSeenFlag()) {
      // Same documented exception as useSafeReducedMotion (lib/motion.ts):
      // client-mount/first-paint detection has no render-time substitute.
      // This must be a *layout* effect specifically — it runs before the
      // browser paints, so a returning visitor never actually sees this
      // overlay flash on screen; deferring it (e.g. via setTimeout) would
      // reintroduce exactly that flash.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      onDone();
    }
    setDecided(true);
    // Intentionally once-only: this is a first-paint gate, not a reaction
    // to changing props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    if (dismissing) return;
    markSeen();
    setDismissing(true);
  }

  useEffect(() => {
    if (!visible || dismissing) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, dismissing]);

  if (!decided || !visible) return null;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!dismissing && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Drive Right Motors — enter showroom"
          onClick={dismiss}
          className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-bg"
        >
          {shouldReduceMotion ? (
            <ReducedMotionIntro onEnter={dismiss} />
          ) : (
            <FullIntro onEnter={dismiss} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReducedMotionIntro({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full flex-col items-center justify-center gap-10 px-6 text-center"
    >
      <h1 className="text-chrome font-display text-4xl font-bold tracking-[0.12em] sm:text-6xl">
        {WORDMARK}
      </h1>
      <div className="h-px w-56 bg-gradient-to-r from-transparent via-accent to-accent-2 sm:w-72" />
      <EnterButton onClick={onEnter} />
    </motion.div>
  );
}

function FullIntro({ onEnter }: { onEnter: () => void }) {
  return (
    <>
      {/* Curtain — two solid panels forming the backdrop, wiped apart on
          exit (the "vertical split" reveal) while the content fades
          independently and a little faster, so it visually clears out of
          the way before the curtain finishes opening onto the hero. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/2 bg-bg"
        exit={{ x: "-100%" }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 bg-bg"
        exit={{ x: "100%" }}
        transition={{ duration: 0.7, ease: EASE }}
      />

      <motion.div
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-10 px-6 text-center"
      >
        <IgnitingWordmark />
        <HorizonDraw />
        <EnterButtonReveal onClick={onEnter} />
      </motion.div>
    </>
  );
}

function IgnitingWordmark() {
  const letters = WORDMARK.split("");
  return (
    <h1 className="font-display text-4xl font-bold tracking-[0.12em] sm:text-6xl md:text-7xl">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="text-chrome relative inline-block [text-shadow:0_0_18px_rgba(255,46,136,0.35),0_0_34px_rgba(34,211,238,0.22)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.35, 1, 0.65, 1] }}
          transition={{
            duration: 0.9,
            times: [0, 0.35, 0.5, 0.62, 0.75, 1],
            delay: 0.15 + index * 0.045,
            ease: "easeInOut",
          }}
        >
          {letter === " " ? " " : letter}
        </motion.span>
      ))}
    </h1>
  );
}

function HorizonDraw() {
  return (
    <motion.div
      className="h-px w-56 origin-center bg-gradient-to-r from-transparent via-accent to-accent-2 sm:w-72"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.9, ease: EASE }}
    />
  );
}

function EnterButtonReveal({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 2.4, ease: EASE }}
    >
      <EnterButton onClick={onClick} />
    </motion.div>
  );
}

function EnterButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="group relative inline-flex items-center justify-center rounded-pill px-8 py-3.5"
    >
      <span className="absolute inset-0 rounded-pill bg-gradient-to-r from-accent to-accent-2 opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute inset-[1.5px] rounded-pill bg-bg transition-colors duration-300 group-hover:bg-bg/90" />
      <span className="relative text-sm font-medium uppercase tracking-[0.2em] text-text transition-[filter] duration-300 group-hover:[filter:drop-shadow(0_0_10px_rgba(255,46,136,0.55))_drop-shadow(0_0_10px_rgba(34,211,238,0.4))]">
        Enter Showroom
      </span>
    </motion.button>
  );
}
