"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { EASE, useSafeReducedMotion } from "@/lib/motion";
import { getCroppedImageBlob } from "@/lib/crop-image";
import MagneticButton from "@/components/ui/MagneticButton";

// Every car photo crops to this ratio, so cards and the hero always get a
// uniform frame — change this one constant to retune site-wide.
export const CROP_ASPECT_RATIO = 16 / 10;

type CropModalProps = {
  imageSrc: string;
  fileName: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

const FOCUSABLE_SELECTOR =
  'input, button, [href], [tabindex]:not([tabindex="-1"])';

// ImageUploader mounts one of these per queued file (via `key={imageSrc}`)
// and unmounts it the instant a crop is confirmed or skipped — there's no
// `open` prop because there's nothing to toggle: existing in the tree at
// all *is* "open" here, and the queue-of-one-at-a-time UX (the next file's
// modal appearing immediately) reads better than waiting out an exit fade
// on every file in a multi-file drop.
export default function CropModal({
  imageSrc,
  fileName,
  onConfirm,
  onCancel,
}: CropModalProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (err) {
      setProcessError(
        err instanceof Error ? err.message : "Couldn't process that crop.",
      );
      setProcessing(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.15 : 0.3, ease: EASE }}
    >
      <motion.div
        className="absolute inset-0 bg-bg/80"
        onClick={onCancel}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 24,
          scale: shouldReduceMotion ? 1 : 0.98,
        }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.15 : 0.45,
          ease: EASE,
        }}
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 w-full max-w-2xl border border-hairline bg-surface p-6 sm:p-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Crop photo
            </p>
            <h2
              id="crop-modal-title"
              className="mt-2 truncate font-display text-xl font-semibold text-text sm:text-2xl"
            >
              {fileName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="shrink-0 text-muted transition-colors duration-300 hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative mt-6 h-[45vh] max-h-[420px] w-full overflow-hidden rounded-card border border-hairline bg-elevated">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={CROP_ASPECT_RATIO}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="shrink-0 text-xs uppercase tracking-[0.15em] text-muted">
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Zoom"
            className="w-full accent-accent"
          />
        </div>

        {processError && (
          <p className="mt-4 text-sm text-red-400">{processError}</p>
        )}

        <div className="mt-8 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-muted transition-colors duration-300 hover:text-text"
          >
            Skip this photo
          </button>
          <MagneticButton
            type="button"
            variant="accent"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
          >
            {processing ? "Processing…" : "Use photo"}
          </MagneticButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
