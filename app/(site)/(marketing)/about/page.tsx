import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Link from "next/link";

import AreaPills from "@/app/components/AreaPills";
import ProcessPath from "@/app/components/ProcessPath";
import ScrollNudge from "@/app/components/ScrollNudge";
import WordReveal from "@/app/components/WordReveal";
import Reveal from "@/app/components/Reveal";
import ServiceSlideshow from "@/app/components/ServiceSlideshow";
import { areas, processSteps, services, site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  ABOUT_PAGE_QUERY,
  CONTACT_QUERY,
  SERVICES_QUERY,
} from "@/sanity/lib/queries";
import type { AboutPage, Contact, ServiceItem } from "@/sanity/lib/types";

const FALLBACK_ABOUT_HERO =
  "A family-run design & build company in Greater London";
const FALLBACK_BIO = `We handle the whole job, from the first drawings to completion, so there's only one team to deal with and the process stays simple for you.

From the first conversation to the final finish, that same team takes responsibility for everything: the drawings, the approvals, the construction and the finish.

We care about the quality of our work and always aim for a high standard. Everything comes with guarantees, so you know it meets the required specification.`;


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
  const [cms, about, contact] = await Promise.all([
    client.fetch<ServiceItem[]>(SERVICES_QUERY),
    client.fetch<AboutPage | null>(ABOUT_PAGE_QUERY),
    client.fetch<Contact | null>(CONTACT_QUERY),
  ]);

  const areaList =
    contact?.areas && contact.areas.length > 0 ? contact.areas : areas;
  const aboutHero = about?.aboutHeroText || FALLBACK_ABOUT_HERO;
  const bioParas = (about?.familyBio || FALLBACK_BIO)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const steps =
    about?.processSteps && about.processSteps.length > 0
      ? about.processSteps.map((s, i) => ({
          n: String(i + 1).padStart(2, "0"),
          title: s.title ?? "",
          text: s.text ?? "",
        }))
      : processSteps;
  // Each shot carries a sharp (hi) and a low-res (lo) source — width only, no
  // crop, so native aspect is kept. The slideshow swaps to `lo` once a photo is
  // behind the stack, to save memory.
  const serviceCards =
    cms.length > 0
      ? cms.map((s) => ({
          title: s.title ?? "",
          blurb: s.blurb ?? "",
          imgs: (s.images ?? [])
            .filter((img) => (img as { asset?: unknown })?.asset)
            .map((img) => ({
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
      <ScrollNudge />
      {/* Intro — a hero like the home slogan: word-by-word reveal, with the
          "design + build" lockup inlined from the logotype */}
      <section
        className={`${PAD} flex min-h-[88svh] items-center justify-center pt-16`}
      >
        <h1 className="mx-auto max-w-6xl text-center font-sans text-3xl font-bold uppercase leading-[1.08] sm:text-5xl sm:tracking-tight lg:text-6xl">
          <WordReveal text={aboutHero} />
        </h1>
      </section>

      {/* Story — sticky title (1/3) + feature bio (2/3), like "What we do" */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="label sticky top-24 !text-ink">A family company</h2>
          </div>
          <Reveal className="lg:col-span-2">
            {bioParas.map((para, i) => (
              <p
                key={i}
                className={`text-2xl leading-snug sm:text-3xl ${i > 0 ? "mt-8" : ""}`}
              >
                {para}
              </p>
            ))}
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
            <ProcessPath steps={steps} />
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
        <AreaPills areas={areaList} widthClass="max-w-3xl" />
      </section>

      {/* Quality guarantee CTA */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 text-center sm:min-h-[90vh] sm:py-24`}
      >
        <Reveal>
          <p className="label">Our quality guarantee</p>
          <h2 className="serif mx-auto mt-6 max-w-4xl text-2xl leading-[1.3] sm:text-4xl">
            We are passionate about our quality of work. We always aim for the
            highest standard of work that we and our clients can always be happy
            with. All our work comes with guarantees, so you can be at peace of
            mind that our services are always up to the required specification.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Link href="/contact" className="link link-underline is-tracked">
              Get in touch
            </Link>
            <a href={site.phoneHref} className="link link-underline is-tracked">
              {site.phone}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
