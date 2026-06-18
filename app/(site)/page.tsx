import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import HomeChrome from "@/app/components/HomeChrome";
import Reveal from "@/app/components/Reveal";
import WipeReveal from "@/app/components/WipeReveal";
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


function ProjectCard({ p }: { p: ProjectListItem }) {
  const tags = [p.category, p.location].filter(Boolean) as string[];
  return (
    <Link
      href={`/projects/${p.slug}`}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-line transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:z-10 hover:scale-[1.03]"
    >
      {/* the whole card scales up on hover (no in-frame zoom) */}
      {p.mainImage && (
        <Image
          src={urlFor(p.mainImage).width(1600).height(900).fit("crop").url()}
          alt={[p.title, p.category, p.location].filter(Boolean).join(", ")}
          fill
          sizes="80vw"
          className="object-cover"
        />
      )}
      {/* simple gradient so the overlay text stays legible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      {/* overlay text stays fixed */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
        <h3 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
          {p.title}
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/40 bg-white/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-white backdrop-blur-sm"
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

      {/* ---------------- Hero ---------------- */}
      {/* Mobile: a tall 80svh crop so the image reads as a proper hero.
          sm+: the uncropped photo at its natural height (scroll for more). */}
      <section id="home-hero" className="relative h-[80svh] w-full sm:h-auto">
        <Image
          src="/hero-main.jpg"
          alt="A Lows Design & Build living room"
          width={3200}
          height={2133}
          priority
          sizes="100vw"
          className="block h-full w-full object-cover sm:h-auto sm:object-contain"
        />
        {/* grey overlay, fades in subtly as scroll begins */}
        <div
          id="hero-overlay"
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-[#424952] transition-opacity duration-700 ease-out"
        />
        {/* Serif tagline carries the hero on mobile; on desktop the sliding
            wordmark takes over, so the tagline is hidden there. */}
        <p className="serif pointer-events-none absolute bottom-6 left-4 z-10 max-w-[15rem] text-2xl leading-[1.1] text-white sm:hidden">
          Family-run design &amp; build across South London.
        </p>
      </section>

      {/* Sticky statement + featured projects share a wrapper so the pinned
          slogan is contained here; it releases and scrolls away once the
          featured block ends, never overlapping the sections below. */}
      <div className="relative">
        {/* ---------------- Family-run statement (Futura) ---------------- */}
        <section className="sticky top-0 flex h-[100svh] flex-col items-center justify-center">
          {/* On mobile the slogan is inset to the same 10% as the project
              thumbnails below so the wide caps never spill past their edges. */}
          <div className="mx-auto w-full max-w-[1900px] px-[10%] sm:px-6">
            <Reveal>
              <h1 className="mx-auto max-w-6xl text-center font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
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
              <p className="label mb-12 sm:mb-16">Featured projects</p>
            </Reveal>

            <div className="space-y-32 sm:space-y-56 lg:space-y-[22rem]">
              {featured.map((p) => (
                <ProjectCard key={p._id} p={p} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- People ---------------- */}
        {/* Kept inside the sticky wrapper and given an opaque paper background:
            it slides up over the pinned slogan as a continuous cover, so the
            slogan never re-emerges in the gap below the last project. */}
        <section
          className={`${PAD} relative z-10 bg-background pb-24 pt-56 sm:pb-32 sm:pt-[28rem]`}
        >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* left third: sticky title that stays put as the cards scroll */}
          <div className="lg:col-span-1">
            <h2 className="label sticky top-24 !text-ink">Family</h2>
          </div>

          {/* right two-thirds: people cards in rows of two */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:col-span-2">
            {/* the two directors, one wide headshot spanning both columns */}
            <div className="sm:col-span-2">
              <WipeReveal>
                <div className="relative aspect-[16/9] overflow-hidden bg-background">
                  <Image
                    src={teamLead.img}
                    alt={teamLead.alt}
                    fill
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover grayscale"
                  />
                </div>
              </WipeReveal>
              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                {teamLead.people.map((pp) => (
                  <div key={pp.name}>
                    <p className="text-base font-medium">{pp.name}</p>
                    <p className="text-sm text-muted">{pp.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {team.map((m) => (
              <div key={m.name}>
                <WipeReveal>
                  <div className="relative aspect-[4/5] overflow-hidden bg-background">
                    <Image
                      src={m.img}
                      alt={m.name}
                      fill
                      loading="eager"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover grayscale"
                    />
                  </div>
                </WipeReveal>
                <p className="mt-4 text-base font-medium">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
        </section>
      </div>
    </>
  );
}
