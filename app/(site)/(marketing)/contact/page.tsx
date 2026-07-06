import { FOOT, FORM_GRID, PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import { CalendlyInline, CalendlyMock } from "@/app/components/Calendly";
import ContactForm from "@/app/components/ContactForm";
import DrawCard from "@/app/components/DrawCard";
import HeroIntro from "@/app/components/HeroIntro";
import WordReveal from "@/app/components/WordReveal";
import { site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { CONTACT_QUERY } from "@/sanity/lib/queries";
import type { Contact } from "@/sanity/lib/types";


export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lows Design & Build for a free, no-obligation estimate on your loft conversion, extension or refurbishment.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 60;

export default async function ContactPage() {
  const contact = await client.fetch<Contact | null>(CONTACT_QUERY);
  const heroText = contact?.contactHeroText || "Let's discuss your next project";
  return (
    <main>
      {/* Hero — just short of full screen so the tops of the two cards below
          peek in at the bottom edge; the big slogan reveals first, then the
          phone + email fade in once it has finished */}
      <section
        className={`${PAD} flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text={heroText} />
        </h1>

        <HeroIntro
          delay={heroText.split(" ").length * 160 + 500}
          className="mt-12 flex w-full max-w-full flex-col items-center gap-3 sm:mt-16 sm:gap-4"
        >
          <h2 className="text-[clamp(1.25rem,6vw,2.25rem)] font-medium tracking-tight">
            <a href={site.phoneHref} className="link-underline">
              {site.phone}
            </a>
          </h2>
          <h2 className="max-w-full break-words text-[clamp(1rem,5vw,2.25rem)] font-medium tracking-tight">
            <a href={`mailto:${site.email}`} className="link-underline">
              {site.email}
            </a>
          </h2>
        </HeroIntro>
      </section>

      {/* Form + book-a-call, side by side. The Calendly booking shows a styled
          mock until a link is set in Sanity. */}
      <section className={`${PAD} ${FOOT} pt-8`}>
        {/* shared two-column form layout — identical sizing/spacing to the
            estimate gate */}
        <div className={FORM_GRID}>
          {/* the cards' outlines draw in on load, staggered — their titles
              already peek into the hero viewport above */}
          <DrawCard delay={600}>
            <p className="label mb-8 !text-ink">Tell us about your project</p>
            <ContactForm
              email={contact?.contactEmail || site.email}
              accessKey={contact?.formAccessKey || undefined}
            />
          </DrawCard>
          {/* same card treatment as the form column — label inside the card,
              one "book a call" heading only (the mock carries no heading of
              its own and goes borderless inside this card on mobile) */}
          <DrawCard delay={800}>
            <p className="label mb-8 !text-ink">Or book a call</p>
            {contact?.calendlyUrl ? (
              <CalendlyInline url={contact.calendlyUrl} />
            ) : (
              <CalendlyMock />
            )}
          </DrawCard>
        </div>
      </section>
    </main>
  );
}
