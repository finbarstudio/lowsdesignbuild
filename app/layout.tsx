import type { Metadata } from "next";
import { Instrument_Serif, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// Primary sans, Bricolage Grotesque (body, nav, headings).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Highlight font, Instrument Serif (used italic for accents).
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lows-site.vercel.app"),
  title: {
    default: "Lows Design & Build, South London Builders",
    template: "%s · Lows Design & Build",
  },
  description:
    "Family-run design & build company in South London. We do loft conversions, house extensions and refurbishments, from the first drawing through to completion.",
  openGraph: {
    title: "Lows Design & Build, South London Builders",
    description:
      "Loft conversions, extensions and refurbishments across South London. Family-run, from design through to completion.",
    type: "website",
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
      className={`${bricolage.variable} ${instrument.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
