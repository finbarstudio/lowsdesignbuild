import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import EstimateCalculator from "@/app/components/EstimateCalculator";
import EstimateGate from "@/app/components/EstimateGate";
import HeroIntro from "@/app/components/HeroIntro";
import WordReveal from "@/app/components/WordReveal";
import { site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { CONTACT_QUERY, ESTIMATE_PAGE_QUERY } from "@/sanity/lib/queries";
import type { Contact, EstimatePage } from "@/sanity/lib/types";


export const metadata: Metadata = {
  title: "Estimate Calculator",
  description:
    "Get an instant indicative cost for your loft conversion or home extension with our free estimate tool.",
  alternates: { canonical: "/estimate" },
};

export const revalidate = 60;

export default async function EstimatePage() {
  const [contact, estimate] = await Promise.all([
    client.fetch<Contact | null>(CONTACT_QUERY),
    client.fetch<EstimatePage | null>(ESTIMATE_PAGE_QUERY),
  ]);
  const email = contact?.contactEmail || site.email;

  // map the CMS tooltips to { key: text } for the calculator
  const infoOverrides: Record<string, string> = {};
  for (const t of estimate?.infoTips ?? []) {
    if (t.key && t.text) infoOverrides[t.key] = t.text;
  }

  const heroText = estimate?.heroText || "Estimate your project";

  return (
    <main>
      {/* Hero — just short of full screen so the tops of the gate cards peek
          in at the bottom edge; the big slogan reveals first, then the intro
          fades in, like contact */}
      <section
        className={`${PAD} flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text={heroText} />
        </h1>
        <HeroIntro delay={heroText.split(" ").length * 160 + 500}>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-muted sm:mt-14 sm:text-lg">
            {estimate?.heroIntro ||
              "Get a rough cost for your project in a few seconds. Pick the options that match your plans and we'll do the maths, then get in touch for an accurate quote."}
          </p>
        </HeroIntro>
      </section>

      {/* Calculator — gated behind an email (or book a call). The section holds a
          comfortable min-height so the (short) gate is centred with real breathing
          room above the footer; once unlocked the calculator fills it. */}
      <section
        className={`${PAD} flex min-h-[70svh] flex-col justify-start pb-[28vh] pt-8`}
      >
        <EstimateGate
          calendlyUrl={contact?.calendlyUrl}
          accessKey={contact?.formAccessKey || undefined}
          recipient={email}
        >
          <EstimateCalculator
            email={email}
            accessKey={contact?.formAccessKey || undefined}
            infoOverrides={infoOverrides}
          />
        </EstimateGate>
      </section>
    </main>
  );
}
