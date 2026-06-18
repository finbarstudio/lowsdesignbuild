import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/app/lib/site";

// Primary sans, Bricolage Grotesque (body, nav, headings).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${bricolage.variable} ${spaceMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
