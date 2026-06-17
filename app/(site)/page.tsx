import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import HomeChrome from "@/app/components/HomeChrome";
import Reveal from "@/app/components/Reveal";
import { team, teamLead } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  description:
    "Family-run design & build across South London. Loft conversions, extensions and refurbishments, from the first drawing through to completion.",
};

// Tight padding, near full-width.
const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

function ProjectCard({ p }: { p: ProjectListItem }) {
  const tags = [p.category, p.location].filter(Boolean) as string[];
  return (
    <Link
      href={`/projects/${p.slug}`}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-line"
    >
      {/* the photo zooms within a fixed frame; nothing else moves */}
      {p.mainImage && (
        <Image
          src={urlFor(p.mainImage).width(1600).height(900).fit("crop").url()}
          alt={[p.title, p.category, p.location].filter(Boolean).join(", ")}
          fill
          sizes="80vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.06]"
        />
      )}
      {/* simple gradient so the overlay text stays legible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      {/* overlay text stays fixed */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
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
  const featured = projects.slice(0, 3);

  return (
    <>
      <HomeChrome projectCount={projects.length} />

      {/* ---------------- Hero (uncropped, scroll for more) ---------------- */}
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
        {/* grey overlay, fades in subtly as scroll begins */}
        <div
          id="hero-overlay"
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-[#424952] transition-opacity duration-700 ease-out"
        />
      </section>

      {/* Sticky statement + featured projects share a wrapper so the pinned
          slogan is contained here; it releases and scrolls away once the
          featured block ends, never overlapping the sections below. */}
      <div className="relative">
        {/* ---------------- Family-run statement (Futura) ---------------- */}
        <section className="sticky top-0 flex h-[100svh] flex-col items-center justify-center">
          <div className={PAD}>
            <Reveal>
              <h1 className="mx-auto max-w-6xl text-center font-sans text-4xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
                Family Run Construction Services in London and Surrounding Areas
              </h1>
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
                <Link href="/projects" className="text-sm text-muted">
                  <span aria-hidden="true" className="mr-2 text-tertiary">
                    ●
                  </span>
                  <span className="link-underline">All projects</span>
                  <sup className="ml-0.5 text-[0.6em] font-medium">
                    {projects.length}
                  </sup>
                </Link>
              </div>
            </Reveal>

            <div className="space-y-32 sm:space-y-56 lg:space-y-[22rem]">
              {featured.map((p) => (
                <ProjectCard key={p._id} p={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------------- People ---------------- */}
      {/* Opaque paper layer above the sticky slogan, covers it during its
          final release so it never pops out below the last project. */}
      <section
        className={`${PAD} relative z-10 bg-background py-24 sm:py-32`}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* left third: sticky title that stays put as the cards scroll */}
          <div className="lg:col-span-1">
            <h2 className="label sticky top-24 !text-ink">Family</h2>
          </div>

          {/* right two-thirds: people cards in rows of two */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:col-span-2">
            {/* the two directors, one wide headshot spanning both columns */}
            <Reveal className="sm:col-span-2">
              <div className="relative aspect-[16/9] overflow-hidden bg-line">
                <Image
                  src={teamLead.img}
                  alt={teamLead.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover grayscale"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                {teamLead.people.map((pp) => (
                  <div key={pp.name}>
                    <p className="text-base font-medium">{pp.name}</p>
                    <p className="text-sm text-muted">{pp.role}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 90}>
                <div className="relative aspect-[4/5] overflow-hidden bg-line">
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover grayscale"
                  />
                </div>
                <p className="mt-4 text-base font-medium">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
