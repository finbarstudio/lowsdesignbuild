import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Link from "next/link";

import AreaPills from "@/app/components/AreaPills";
import ProcessPath from "@/app/components/ProcessPath";
import WordReveal from "@/app/components/WordReveal";
import Reveal from "@/app/components/Reveal";
import ServiceSlideshow from "@/app/components/ServiceSlideshow";
import { areas, services, site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SERVICES_QUERY } from "@/sanity/lib/queries";
import type { ServiceItem } from "@/sanity/lib/types";


export const metadata: Metadata = {
  title: "About",
  description:
    "Lows Design & Build is a family-run design and build company based in Greater London, providing an end-to-end service from design to completion.",
  alternates: { canonical: "/about" },
};

export const revalidate = 60;

export default async function AboutPage() {
  // Services come from Sanity so the client can edit them. Until any are added
  // there, fall back to the built-in copy so the section is never empty.
  const cms = await client.fetch<ServiceItem[]>(SERVICES_QUERY);
  // Each shot carries a sharp (hi) and a low-res (lo) source — width only, no
  // crop, so native aspect is kept. The slideshow swaps to `lo` once a photo is
  // behind the stack, to save memory.
  const serviceCards =
    cms.length > 0
      ? cms.map((s) => ({
          title: s.title ?? "",
          blurb: s.blurb ?? "",
          imgs: (s.images ?? []).map((img) => ({
            hi: urlFor(img).width(640).quality(80).auto("format").url(),
            lo: urlFor(img).width(280).quality(45).auto("format").url(),
          })),
        }))
      : services.map((s) => ({
          ...s,
          imgs: s.imgs.map((src) => ({ hi: src, lo: src })),
        }));

  return (
    <main>
      {/* Intro — a hero like the home slogan: word-by-word reveal, with the
          "design + build" lockup inlined from the logotype */}
      <section
        className={`${PAD} flex min-h-[88svh] items-center justify-center pt-16`}
      >
        <h1 className="mx-auto max-w-6xl text-center font-sans text-3xl font-bold uppercase leading-[1.08] sm:text-5xl sm:tracking-tight lg:text-6xl">
          <WordReveal
            text="A family-run design & build company in Greater London"
          />
        </h1>
      </section>

      {/* Story — sticky title (1/3) + feature bio (2/3), like "What we do" */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="label sticky top-24 !text-ink">A family company</h2>
          </div>
          <Reveal className="lg:col-span-2">
            <p className="text-2xl leading-snug sm:text-3xl">
              We handle the whole job, from the first drawings to completion, so
              there&apos;s only one team to deal with and the process stays
              simple for you.
            </p>
            <p className="mt-8 text-2xl leading-snug sm:text-3xl">
              From the first conversation to the final finish, that same team
              takes responsibility for everything: the drawings, the approvals,
              the construction and the finish.
            </p>
            <p className="mt-8 text-2xl leading-snug sm:text-3xl">
              We care about the quality of our work and always aim for a high
              standard. Everything comes with guarantees, so you know it meets
              the required specification.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What we do */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* left: sticky title */}
          <div className="lg:col-span-1">
            <h2 className="label sticky top-24 !text-ink">What we do</h2>
          </div>

          {/* right: hover-list of services — name reveals a cursor-following image */}
          <Reveal className="lg:col-span-2">
            <ServiceSlideshow services={serviceCards} />
          </Reveal>
        </div>
      </section>

      {/* Process — sticky title (1/3) + pathway (2/3), like "What we do" */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="label sticky top-24 !text-ink">Our process</h2>
          </div>
          <div className="lg:col-span-2">
            <ProcessPath />
          </div>
        </div>
      </section>

      {/* Areas we cover */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 text-center sm:min-h-[70vh] sm:py-24`}
      >
        <Reveal>
          <p className="label mb-10 sm:mb-14">Where we work</p>
        </Reveal>
        <AreaPills areas={areas} />
      </section>

      {/* Quality guarantee CTA */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 text-center sm:min-h-[90vh] sm:py-24`}
      >
        <Reveal>
          <p className="label">Our quality guarantee</p>
          <h2 className="serif mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl">
            Built to a standard we&apos;re proud to put our name to.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            <Link href="/contact" className="link-underline">
              Get in touch
            </Link>
            <a href={site.phoneHref} className="link-underline">
              {site.phone}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
