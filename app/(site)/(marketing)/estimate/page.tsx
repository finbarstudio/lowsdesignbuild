import type { Metadata } from "next";

import EstimateCalculator from "@/app/components/EstimateCalculator";
import Reveal from "@/app/components/Reveal";

const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

export const metadata: Metadata = {
  title: "Estimate Calculator",
  description:
    "Get an instant indicative cost for your loft conversion or home extension with our free estimate tool.",
};

export default function EstimatePage() {
  return (
    <main className={`${PAD} py-24 pt-36`}>
      <Reveal>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:gap-x-6">
          <p className="label lg:col-span-12">Free tool</p>
          <h1 className="serif text-4xl sm:text-7xl lg:col-span-7">
            Estimate calculator
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted lg:col-span-3 lg:col-start-10 lg:self-end">
            Get a rough cost for your project in a few seconds. Pick the options
            that match your plans and we&apos;ll do the maths, then get in touch
            for an accurate quote.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-16 max-w-5xl pt-12">
          <EstimateCalculator />
        </div>
      </Reveal>
    </main>
  );
}
