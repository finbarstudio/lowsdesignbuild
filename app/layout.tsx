import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { siteUrl } from "@/app/lib/site";

// Primary sans — Authentic Sans (self-hosted, SIL OFL). The only typeface
// besides Space Mono. Weights 60/90/130/150 map to light→bold.
const authentic = localFont({
  variable: "--font-authentic",
  display: "swap",
  src: [
    { path: "./fonts/authentic-sans-60.woff2", weight: "300", style: "normal" },
    { path: "./fonts/authentic-sans-90.woff2", weight: "400", style: "normal" },
    { path: "./fonts/authentic-sans-130.woff2", weight: "600", style: "normal" },
    { path: "./fonts/authentic-sans-150.woff2", weight: "700", style: "normal" },
  ],
});

// Mono, Space Mono — used tracked + uppercase for labels / sub-headings.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lows Design & Build, South London Builders",
    template: "%s · Lows Design & Build",
  },
  description:
    "Family-run design & build company in South London. We do loft conversions, house extensions and refurbishments, from the first drawing through to completion.",
  alternates: { canonical: "/" },
  keywords: [
    "design and build South London",
    "loft conversions",
    "house extensions",
    "refurbishments",
    "builders Beckenham",
    "builders Bromley",
  ],
  openGraph: {
    title: "Lows Design & Build, South London Builders",
    description:
      "Loft conversions, extensions and refurbishments across South London. Family-run, from design through to completion.",
    type: "website",
    locale: "en_GB",
    siteName: "Lows Design & Build",
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Lows Design & Build" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lows Design & Build, South London Builders",
    description:
      "Loft conversions, extensions and refurbishments across South London. Family-run, from design through to completion.",
    images: ["/og.jpg"],
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
      className={`${authentic.variable} ${spaceMono.variable} antialiased`}
    >
      {/* The hero wordmark is hidden by default in CSS (see .logo-mask) and only
          revealed when HomeChrome adds `entrance-go`, so it never flashes in and
          jumps to hidden — no pre-paint script needed. A CSS fallback reveals it
          if JS never fires (see globals.css). */}
      <body>{children}</body>
    </html>
  );
}
