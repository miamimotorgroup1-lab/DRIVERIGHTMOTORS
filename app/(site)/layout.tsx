import type { Metadata } from "next";
import LeadModalProvider from "@/components/providers/LeadModalProvider";
import Footer from "@/components/ui/Footer";
import Nav from "@/components/ui/Nav";
import { inter, spaceGrotesk } from "@/lib/fonts";
import SmoothScrollProvider from "./smooth-scroll-provider";
import "../globals.css";

export const metadata: Metadata = {
  // TODO: swap for the real production domain before launch.
  metadataBase: new URL("https://driverightmotors.com"),
  title: "Drive Right Motors",
  description: "Quality used vehicles and trustworthy service.",
  openGraph: {
    siteName: "Drive Right Motors",
    type: "website",
    locale: "en_US",
    title: "Drive Right Motors",
    description: "Quality used vehicles and trustworthy service.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        <SmoothScrollProvider>
          <LeadModalProvider>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </LeadModalProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
