import { FOOT, FORM_CARD, FORM_GRID, PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import { CalendlyInline, CalendlyMock } from "@/app/components/Calendly";
import ContactForm from "@/app/components/ContactForm";
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
      {/* Hero — full screen: big centred slogan reveals first; the phone +
          email fade in once it has finished */}
      <section
        className={`${PAD} flex min-h-[100svh] flex-col items-center justify-center text-center`}
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
          {/* FORM_CARD: on mobile the form sits in a subtle card so it separates
              cleanly from the booking card below it */}
          <div className={FORM_CARD}>
            <p className="label mb-8 !text-ink">Tell us about your project</p>
            <ContactForm
              email={contact?.contactEmail || site.email}
              accessKey={contact?.formAccessKey || undefined}
            />
          </div>
          {/* same card treatment as the form column — label inside the card,
              one "book a call" heading only (the mock carries no heading of
              its own and goes borderless inside this card on mobile) */}
          <div className={FORM_CARD}>
            <p className="label mb-8 !text-ink">Or book a call</p>
            {contact?.calendlyUrl ? (
              <CalendlyInline url={contact.calendlyUrl} />
            ) : (
              <CalendlyMock />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
