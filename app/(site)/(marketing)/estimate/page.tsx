import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import EstimateCalculator from "@/app/components/EstimateCalculator";
import ScrollNudge from "@/app/components/ScrollNudge";
import WordReveal from "@/app/components/WordReveal";


export const metadata: Metadata = {
  title: "Estimate Calculator",
  description:
    "Get an instant indicative cost for your loft conversion or home extension with our free estimate tool.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  return (
    <main>
      <ScrollNudge />

      {/* Hero — full screen: big slogan with the intro beneath, like contact */}
      <section
        className={`${PAD} flex min-h-[100svh] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text="Estimate your project" />
        </h1>
        <p className="mt-10 max-w-xl text-base leading-relaxed text-muted sm:mt-14 sm:text-lg">
          Get a rough cost for your project in a few seconds. Pick the options
          that match your plans and we&apos;ll do the maths, then get in touch
          for an accurate quote.
        </p>
      </section>

      {/* Calculator — full width, with a little extra breathing room L/R */}
      <section className={`${PAD} pb-24 sm:pb-32`}>
        <p className="label mb-10 !text-ink">Estimate calculator</p>
        <div className="sm:px-4 lg:px-10">
          <EstimateCalculator />
        </div>
      </section>
    </main>
  );
}
