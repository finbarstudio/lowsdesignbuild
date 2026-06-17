import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Reveal from "@/app/components/Reveal";
import { areas, processSteps, services, site } from "@/app/lib/site";

const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lows Design & Build is a family-run design and build company based in Greater London, providing an end-to-end service from design to completion.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Intro */}
      <section
        className={`${PAD} flex min-h-[70vh] flex-col justify-end pb-16 pt-36`}
      >
        <Reveal>
          <p className="label">About us</p>
          <h1 className="serif mt-5 max-w-4xl text-4xl sm:text-7xl">
            A family-run design &amp; build company in Greater London.
          </h1>
        </Reveal>
      </section>

      {/* Story */}
      <section
        className={`${PAD} flex min-h-[90vh] flex-col justify-center py-24`}
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
              We provide an end-to-end service that covers all aspects of
              building works from design to completion — making the process as
              straightforward as possible for our clients.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              From the first conversation to the finishing touches, you deal
              with one team that takes responsibility for the whole project: the
              drawings, the approvals, the construction and the final finish.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              We&apos;re passionate about the quality of our work and always aim
              for the highest standard — all of it comes with guarantees, so you
              have peace of mind that everything is up to specification.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What we do */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <Reveal>
          <p className="label">What we do</p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-12">
          {services.map((s) => (
            <Reveal key={s.title} className="lg:col-span-3">
              <h3 className="serif text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.blurb}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section
        className={`${PAD} flex min-h-[90vh] flex-col justify-center py-24`}
      >
        <Reveal>
          <p className="label">Our process</p>
          <h2 className="serif mt-6 max-w-2xl text-3xl sm:text-5xl">
            The key stages of a successful project.
          </h2>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <Reveal key={step.n}>
              <span className="serif text-3xl text-copper">{step.n}</span>
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
        className={`${PAD} flex min-h-[70vh] flex-col justify-center py-24 text-center`}
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
        className={`${PAD} flex min-h-[90vh] flex-col justify-center py-24 text-center`}
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
