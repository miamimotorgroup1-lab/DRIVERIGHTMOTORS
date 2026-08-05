// Site-wide, barely-there texture: fine film grain + scanlines over the
// near-black background. Static (no animation) on purpose — it's cheap,
// it's honest about being "texture, not costume," and it never competes
// with the one glowing element rule. Mounted once in app/(site)/layout.tsx
// so every page gets it for free; -z-10 keeps it under all real content
// while still painting above the plain body background color.
export default function Atmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-overlay" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </div>
  );
}
