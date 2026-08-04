import type { Metadata } from "next";
import { inter, spaceGrotesk } from "@/lib/fonts";
import "../globals.css";

// Separate root layout from app/(site)/layout.tsx — no public Nav/Footer/
// LeadModalProvider/SmoothScrollProvider here. Route groups don't affect
// the URL, so /admin and /admin/login are unaffected; this just keeps the
// admin shell full-bleed and free of marketing chrome.
export const metadata: Metadata = {
  // TODO: swap for the real production domain before launch (see the same
  // TODO in app/(site)/layout.tsx).
  metadataBase: new URL("https://driverightmotors.com"),
  title: "Admin — Drive Right Motors",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text font-body">{children}</body>
    </html>
  );
}
