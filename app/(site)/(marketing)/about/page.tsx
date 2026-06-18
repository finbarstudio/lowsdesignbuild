import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Reveal from "@/app/components/Reveal";
import { areas, processSteps, services, site } from "@/app/lib/site";


export const metadata: Metadata = {
  title: "About",
  description:
    "Lows Design & Build is a family-run design and build company based in Greater London, providing an end-to-end service from design to completion.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      {/* Intro */}
      <section
        className={`${PAD} flex min-h-[55vh] flex-col justify-end pb-16 pt-28 sm:min-h-[70vh] sm:pt-36`}
      >
        <Reveal>
          <p className="label">About us</p>
          <h1 className="serif mt-5 max-w-4xl text-4xl sm:text-6xl">
            A family-run design &amp; build company in Greater London.
          </h1>
        </Reveal>
      </section>

      {/* Story */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 sm:min-h-[90vh] sm:py-24`}
      >
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7 lg:col-start-1">
            <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/3]">
              <Image
                src="/img/about.jpg"
                alt="Open-plan kitchen extension with Crittall doors"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9">
            <p className="text-sm leading-relaxed text-muted">
              We handle the whole job, from the first drawings to completion, so
              there&apos;s only one team to deal with and the process stays
              simple for you.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              From the first conversation to the final finish, that same team
              takes responsibility for everything: the drawings, the approvals,
              the construction and the finish.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              We care about the quality of our work and always aim for a high
              standard. Everything comes with guarantees, so you know it meets
              the required specification.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What we do */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <Reveal>
          <p className="label">What we do</p>
        </Reveal>
        <Reveal className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-16 sm:grid-cols-3 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="flex flex-col">
              {s.img ? (
                // group is the thumbnail only — the overlay never spawns from
                // hovering the text.
                <div className="group relative w-24 hover:z-20 sm:w-28">
                  <div className="aspect-[3/4] overflow-hidden bg-line">
                    <Image
                      src={s.img}
                      alt={s.title}
                      width={720}
                      height={960}
                      sizes="112px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* larger overlay that grows from the centre of the thumbnail */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 w-56 -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100">
                    <div className="aspect-[3/4] overflow-hidden bg-line shadow-2xl ring-1 ring-black/5">
                      <Image
                        src={s.img}
                        alt=""
                        width={720}
                        height={960}
                        sizes="224px"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] w-24 sm:w-28" />
              )}
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {s.blurb}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Process */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 sm:min-h-[90vh] sm:py-24`}
      >
        <Reveal>
          <p className="label">Our process</p>
          <h2 className="serif mt-6 max-w-2xl text-3xl sm:text-5xl">
            The key stages of a successful project.
          </h2>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 80}>
              <span className="text-2xl font-bold tracking-tight text-copper">
                {step.n}
              </span>
              <h3 className="mt-3 text-base font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.text}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Areas we cover */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 text-center sm:min-h-[70vh] sm:py-24`}
      >
        <Reveal>
          <p className="label">Where we work</p>
          <p className="serif mx-auto mt-6 max-w-5xl text-2xl leading-relaxed sm:text-3xl">
            {areas.join(" · ")}
          </p>
        </Reveal>
      </section>

      {/* Quality guarantee CTA */}
      <section
        className={`${PAD} flex min-h-0 flex-col justify-center py-20 sm:min-h-[90vh] sm:py-24 text-center`}
      >
        <Reveal>
          <p className="label">Our quality guarantee</p>
          <h2 className="serif mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl">
            Built to a standard we&apos;re proud to put our name to.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            <Link
              href="/contact"
              className="link-underline"
            >
              Get in touch
            </Link>
            <a
              href={site.phoneHref}
              className="link-underline"
            >
              {site.phone}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
