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

function ProjectCard({ p }: { p: ProjectListItem }) {
  const tags = [p.category, p.location].filter(Boolean) as string[];
  // Both layers ease, but scale by slightly different amounts on hover.
  const ease =
    "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <Link
      href={`/projects/${p.slug}`}
      className="group relative block aspect-[16/9] w-full"
    >
      {/* image layer — the whole image scales up as one piece (not a crop-zoom) */}
      <div
        className={`absolute inset-0 overflow-hidden bg-line ${ease} group-hover:scale-[1.03]`}
      >
        {p.mainImage && (
          <Image
            src={urlFor(p.mainImage).width(1600).height(900).fit("crop").url()}
            alt={p.title ?? ""}
            fill
            sizes="80vw"
            className="object-cover"
          />
        )}
        {/* simple gradient so the overlay text stays legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
      </div>

      {/* text layer — scales a touch differently for a refined parallax */}
      <div
        className={`absolute inset-x-0 bottom-0 flex origin-bottom-left flex-col gap-3 p-6 sm:p-8 ${ease} group-hover:scale-[1.05]`}
      >
        <h3 className="serif text-3xl leading-none text-white sm:text-4xl">
          {p.title}
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const projects = await client.fetch<ProjectListItem[]>(PROJECTS_QUERY);
  const featured = projects.slice(0, 6);

  return (
    <>
      <HomeChrome projectCount={projects.length} />

      {/* ---------------- Hero (uncropped — scroll for more) ---------------- */}
      <section id="home-hero" className="relative w-full">
        <Image
          src="/hero-main.jpg"
          alt="A Lows Design & Build living room"
          width={3200}
          height={2133}
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

      {/* Sticky statement + featured projects share a wrapper so the pinned
          slogan is contained here — it releases and scrolls away once the
          featured block ends, never overlapping the sections below. */}
      <div className="relative">
        {/* ---------------- Family-run statement (Futura) ---------------- */}
        <section className="sticky top-0 flex h-screen flex-col items-center justify-center">
          <div className={PAD}>
            <Reveal>
              <h2 className="mx-auto max-w-6xl text-center font-sans text-5xl font-bold uppercase leading-[1.05] tracking-tight sm:text-7xl">
                Family Run Construction Services in London and Surrounding Areas
              </h2>
            </Reveal>
          </div>
        </section>

        {/* ---------------- Featured projects (image cards) ------------- */}
        {/* Transparent: each opaque card wipes over the sticky slogan behind,
            and the slogan shows in the gaps between them. No bottom padding so
            the slogan stays hidden behind the last card at the very end. */}
        {featured.length > 0 && (
          <section className="relative z-10 px-[10%] pt-24 sm:pt-32">
            <Reveal>
              <div className="mb-12 flex items-end justify-between sm:mb-16">
                <p className="label">Featured projects</p>
                <Link
                  href="/projects"
                  className="link-underline text-sm text-muted"
                >
                  All projects
                  <sup className="ml-0.5 font-serif text-[0.7em] italic">
                    {projects.length}
                  </sup>
                </Link>
              </div>
            </Reveal>

            <div className="space-y-16 sm:space-y-24">
              {featured.map((p) => (
                <ProjectCard key={p._id} p={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------------- About ---------------- */}
      {/* Opaque paper layer above the sticky slogan — covers it during its
          final release so it never pops out below the last project. */}
      <section
        className={`${PAD} relative z-10 flex min-h-[90vh] flex-col justify-center bg-background py-24`}
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
              className="mt-7 inline-block text-sm link-underline"
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
              <a
                href={`mailto:${site.email}`}
                className="link-underline"
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
