import { Space_Grotesk, Inter } from "next/font/google";

// Shared across both root layouts (app/(site)/layout.tsx and
// app/(admin)/layout.tsx) — next/font should be called once per font and
// reused, not re-instantiated in every layout that needs it.
export const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});
