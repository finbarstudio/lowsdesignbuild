import type { Metadata } from "next";

import ContactForm from "@/app/components/ContactForm";
import Reveal from "@/app/components/Reveal";
import { areas, site } from "@/app/lib/site";

const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lows Design & Build for a free, no-obligation estimate on your loft conversion, extension or refurbishment.",
};

export default function ContactPage() {
  return (
    <main className={`${PAD} flex min-h-screen flex-col justify-center py-24 pt-36`}>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-5 lg:col-start-1">
          <p className="label">Get in touch</p>
          <h1 className="serif mt-5 text-4xl sm:text-6xl">
            Let&apos;s discuss your next project.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Fill in the form and we&apos;ll respond as soon as we can, or reach
            us directly using the details below.
          </p>

          <dl className="mt-12 space-y-6">
            <div>
              <dt className="label">Phone</dt>
              <dd className="mt-1">
                <a href={site.phoneHref} className="text-lg hover:text-copper">
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${site.email}`}
                  className="text-lg hover:text-copper"
                >
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label">Areas we cover</dt>
              <dd className="mt-1 text-sm text-muted">{areas.join(" · ")}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:col-start-8 lg:self-center">
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
