import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import AreaPills from "@/app/components/AreaPills";
import ContactForm from "@/app/components/ContactForm";
import ScrollNudge from "@/app/components/ScrollNudge";
import WordReveal from "@/app/components/WordReveal";
import { areas as fallbackAreas, site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";


export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lows Design & Build for a free, no-obligation estimate on your loft conversion, extension or refurbishment.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
  const areas =
    settings?.areas && settings.areas.length > 0
      ? settings.areas
      : fallbackAreas;
  return (
    <main>
      <ScrollNudge />
      {/* Hero — full screen: big centred slogan like the home page, with the
          phone + email sitting beneath it */}
      <section
        className={`${PAD} flex min-h-[100svh] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text="Let's discuss your next project" />
        </h1>

        <div className="mt-12 flex flex-col items-center gap-3 sm:mt-16 sm:gap-4">
          <h2 className="text-2xl font-medium tracking-tight sm:text-4xl">
            <a href={site.phoneHref} className="link-underline">
              {site.phone}
            </a>
          </h2>
          <h2 className="text-2xl font-medium tracking-tight sm:text-4xl">
            <a href={`mailto:${site.email}`} className="link-underline">
              {site.email}
            </a>
          </h2>
        </div>
      </section>

      {/* Areas (1/3) + form (2/3) — static, no scroll-reveal */}
      <section className={`${PAD} pb-24 sm:pb-32`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-1">
            <p className="label mb-8 !text-ink">Areas we cover</p>
            <AreaPills areas={areas} align="left" animate={false} />
          </div>
          <div className="lg:col-span-2">
            <p className="label mb-8 !text-ink">Tell us about your project</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
