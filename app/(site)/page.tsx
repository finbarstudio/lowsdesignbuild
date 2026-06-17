import Image from "next/image";
import Link from "next/link";

import HomeChrome from "@/app/components/HomeChrome";
import Reveal from "@/app/components/Reveal";
import { areas, processSteps, services, site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;

// Tight padding, near full-width.
const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

function ProjectCell({
  p,
  className,
}: {
  p: ProjectListItem;
  className: string;
}) {
  return (
    <Reveal className={className}>
      <Link href={`/projects/${p.slug}`} className="group block">
        {/* uniform height so rows align top and bottom; widths vary by column span */}
        <div className="relative h-[64vw] overflow-hidden bg-line sm:h-[48vw] lg:h-[32rem]">
          {p.mainImage && (
            <Image
              src={urlFor(p.mainImage).width(1200).height(1200).fit("crop").url()}
              alt={p.title ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]"
            />
          )}
        </div>
        <div className="mt-4">
          <p className="label">
            {[p.category, p.location].filter(Boolean).join(" — ")}
          </p>
          <h3 className="serif mt-2 text-2xl sm:text-3xl">{p.title}</h3>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function HomePage() {
  const projects = await client.fetch<ProjectListItem[]>(PROJECTS_QUERY);
  const featured = projects.slice(0, 6);
  const rows: ProjectListItem[][] = [];
  for (let i = 0; i < featured.length; i += 2) rows.push(featured.slice(i, i + 2));

  return (
    <>
      <HomeChrome />

      {/* ---------------- Hero (uncropped — scroll for more) ---------------- */}
      <section id="home-hero" className="relative w-full">
        <Image
          src="/hero3.png"
          alt="A Lows Design & Build living room"
          width={4961}
          height={3508}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
        {/* grey overlay — fades in subtly as scroll begins */}
        <div
          id="hero-overlay"
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-[#424952] transition-opacity duration-700 ease-out"
        />
      </section>

      {/* ---------------- End-to-end statement (Instrument Serif, centred) -- */}
      <section
        className={`${PAD} flex min-h-screen flex-col items-center justify-center py-24 text-center`}
      >
        <Reveal>
          <p className="serif mx-auto max-w-5xl text-3xl leading-[1.25] sm:text-5xl sm:leading-[1.22]">
            We provide an end-to-end service that covers every part of the
            build, making the whole process as straightforward as possible —
            finished to a standard we&apos;re proud to put our name to.
          </p>
        </Reveal>
      </section>

      {/* ---------------- Family-run statement (Futura) ------------------ */}
      {/* Sticky: stays pinned centre-screen until the image below scrolls over it */}
      <section className="sticky top-0 flex h-screen flex-col items-center justify-center">
        <div className={PAD}>
          <Reveal>
            <h2 className="mx-auto max-w-6xl text-center font-sans text-5xl font-bold uppercase leading-[1.05] tracking-tight sm:text-7xl">
              Family Run Construction Services in London and Surrounding Areas
            </h2>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Full landscape image (A4) ---------------------- */}
      {/* Scrolls up and sits on top of the sticky statement above */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-[10%] py-24">
        <div className="relative aspect-[297/210] w-full overflow-hidden">
          <Image
            src="/img/about.jpg"
            alt="A Lows Design & Build project"
            fill
            sizes="70vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ---------------- Selected work (asymmetric grid) ---------------- */}
      {featured.length > 0 && (
        <section className={`${PAD} py-24 sm:py-32`}>
          <Reveal>
            <div className="mb-16 flex items-end justify-between sm:mb-24">
              <p className="label">Selected work</p>
              <Link
                href="/projects"
                className="text-sm text-muted underline-offset-4 hover:text-copper hover:underline"
              >
                All projects
              </Link>
            </div>
          </Reveal>

          <div className="space-y-20 sm:space-y-28">
            {rows.map((row, r) => {
              const even = r % 2 === 0;
              return (
                <div
                  key={r}
                  className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-12"
                >
                  <ProjectCell
                    p={row[0]}
                    className={
                      even
                        ? "lg:col-span-7 lg:col-start-1"
                        : "lg:col-span-4 lg:col-start-1"
                    }
                  />
                  {row[1] && (
                    <ProjectCell
                      p={row[1]}
                      className={
                        even
                          ? "lg:col-span-4 lg:col-start-9"
                          : "lg:col-span-6 lg:col-start-7"
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- About ---------------- */}
      <section
        className={`${PAD} flex min-h-[90vh] flex-col justify-center py-24`}
      >
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7 lg:col-start-1">
            <div className="relative aspect-[16/11] overflow-hidden">
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
            <p className="label">Who we are</p>
            <h2 className="serif mt-5 text-3xl leading-[1.15] sm:text-4xl">
              A family-run team that treats your home like our own.
            </h2>
            <p className="mt-7 text-sm leading-relaxed text-muted">
              We&apos;re {site.name} — a design and build company based in
              Greater London. From the first conversation to the finishing
              touches you deal with one team, responsible for the whole project.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-block border-b border-ink/25 pb-1 text-sm transition-colors hover:border-copper hover:text-copper"
            >
              More about us
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Approach ---------------- */}
      <section className={`${PAD} py-24 sm:py-32`}>
        <Reveal>
          <p className="label">What we do</p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-12">
          {services.map((s, i) => (
            <Reveal
              key={s.title}
              className={
                ["lg:col-span-3", "lg:col-span-3", "lg:col-span-3", "lg:col-span-3"][
                  i
                ]
              }
            >
              <h3 className="serif text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.blurb}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="label mt-24">How it works</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <Reveal key={step.n}>
              <span className="serif text-3xl text-copper">{step.n}</span>
              <h4 className="mt-3 text-base font-medium">{step.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.text}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Areas ---------------- */}
      <section
        className={`${PAD} flex min-h-[90vh] flex-col justify-center py-24 text-center`}
      >
        <Reveal>
          <p className="label">Where we work</p>
          <p className="serif mx-auto mt-6 max-w-5xl text-2xl leading-relaxed sm:text-3xl">
            {areas.join(" · ")}
          </p>
        </Reveal>
      </section>

      {/* ---------------- Contact CTA ---------------- */}
      <section className="">
        <div
          className={`${PAD} flex min-h-[90vh] flex-col justify-center py-24 text-center`}
        >
          <Reveal>
            <h2 className="serif text-4xl sm:text-6xl">
              Let&apos;s build something.
            </h2>
            <p className="mt-8 text-sm text-muted">
              Tell us about your project for a free, no-obligation estimate.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
              <Link
                href="/contact"
                className="border-b border-ink/30 pb-1 transition-colors hover:border-copper hover:text-copper"
              >
                Get in touch
              </Link>
              <a
                href={site.phoneHref}
                className="border-b border-ink/30 pb-1 transition-colors hover:border-copper hover:text-copper"
              >
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="border-b border-ink/30 pb-1 transition-colors hover:border-copper hover:text-copper"
              >
                {site.email}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
