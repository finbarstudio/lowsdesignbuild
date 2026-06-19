import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";

import ContactForm from "@/app/components/ContactForm";
import Reveal from "@/app/components/Reveal";
import WordReveal from "@/app/components/WordReveal";
import { areas, site } from "@/app/lib/site";


export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lows Design & Build for a free, no-obligation estimate on your loft conversion, extension or refurbishment.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      {/* Hero — big word-by-word statement, like the home/about heroes */}
      <section
        className={`${PAD} flex min-h-[58svh] items-end pb-12 pt-32 sm:min-h-[68svh] sm:pb-16`}
      >
        <h1 className="max-w-5xl font-sans text-4xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text="Let's discuss your next project" />
        </h1>
      </section>

      {/* Details (sticky) + form, in the sticky-label pattern */}
      <section className={`${PAD} pb-24 sm:pb-32`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-10">
              <div>
                <p className="label mb-5 !text-ink">Get in touch</p>
                <p className="max-w-xs text-sm leading-relaxed text-muted">
                  Fill in the form and we&apos;ll respond as soon as we can, or
                  reach us directly using the details below.
                </p>
              </div>

              <dl className="space-y-6">
                <div>
                  <dt className="label">Phone</dt>
                  <dd className="mt-1">
                    <a href={site.phoneHref} className="text-lg link-underline">
                      {site.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="label">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${site.email}`}
                      className="text-lg link-underline"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="label">Areas we cover</dt>
                  <dd className="mt-1 max-w-xs text-sm leading-relaxed text-muted">
                    {areas.join(" · ")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Reveal className="lg:col-span-2">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
