import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import EstimateCalculator from "@/app/components/EstimateCalculator";
import Reveal from "@/app/components/Reveal";
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
      {/* Hero — big word-by-word heading with the intro alongside */}
      <section className={`${PAD} pb-12 pt-32 sm:pb-16`}>
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <h1 className="font-sans text-4xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:col-span-8 lg:text-7xl">
            <WordReveal text="Estimate your project" />
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted lg:col-span-4 lg:self-end">
            Get a rough cost for your project in a few seconds. Pick the options
            that match your plans and we&apos;ll do the maths, then get in touch
            for an accurate quote.
          </p>
        </div>
      </section>

      {/* Calculator — full width so its own columns have room to breathe */}
      <section className={`${PAD} pb-24 sm:pb-32`}>
        <Reveal>
          <p className="label mb-10 !text-ink">Estimate calculator</p>
          <div className="max-w-5xl">
            <EstimateCalculator />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
