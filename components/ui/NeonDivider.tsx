// Thin gradient hairline used as a section divider — the "neon horizon
// line" motif. A crisp gradient core plus a soft blurred echo behind it
// reads as a glow without an actual box-shadow (cheaper, no layout risk).
type NeonDividerProps = {
  className?: string;
};

export default function NeonDivider({ className = "" }: NeonDividerProps) {
  return (
    <div aria-hidden="true" className={`relative h-px w-full ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-accent-2 opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-accent-2 opacity-50 blur-[3px]" />
    </div>
  );
}
