import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import CursorTrail from "@/app/components/CursorTrail";
import DropReveal from "@/app/components/DropReveal";
import HomeChrome from "@/app/components/HomeChrome";
import InstagramFeed from "@/app/components/InstagramFeed";
import InstagramStrip from "@/app/components/InstagramStrip";
import WipeReveal from "@/app/components/WipeReveal";
import WordReveal from "@/app/components/WordReveal";
import {
  site,
  team as fallbackTeam,
  teamLead as fallbackTeamLead,
} from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { FAMILY_QUERY, HOME_PAGE_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { Family, HomePage, ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;

// Tiny base64 blur of the bundled hero, used as an instant placeholder when no
// CMS hero is set (so there is always something on screen immediately).
const FALLBACK_HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAEAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAEAAYAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAv/aAAwDAQACEQMRAD8Ap2V7cRRCRSu3oeeh/wD1Vrpq1wFLyAbVzkjvgZ45rEtoZpYm6jf06e3t/StSS1lKhgORn5exyMc8VxyZvFF7U5Slr5x5BGcd+lcr/aC/88z+f/1q6a/lgltfJnUqMfr+Fc59l07+8fzqLy6Cle+h/9k=";

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

      {/* overlay text: title and tags scale a touch more than the card and
          with a stagger, so they lift off the image on hover (parallax feel) */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:gap-3 sm:p-8">
        <h3 className="origin-bottom-left text-xl font-semibold leading-tight tracking-tight text-white transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:120ms] group-hover:scale-[1.05] sm:text-3xl lg:text-4xl">
          {p.title}
        </h3>
        {tags.length > 0 && (
          <div className="flex origin-bottom-left flex-wrap gap-2 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:220ms] group-hover:scale-[1.1]">
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
  const [projects, home, family] = await Promise.all([
    client.fetch<ProjectListItem[]>(PROJECTS_QUERY),
    client.fetch<HomePage | null>(HOME_PAGE_QUERY),
    client.fetch<Family | null>(FAMILY_QUERY),
  ]);
  const featured = projects.slice(0, 3);

  // Hero comes from the CMS when set; Sanity supplies a tiny lqip blur as the
  // instant placeholder. Otherwise fall back to the bundled image + its blur.
  const hero = home?.heroImage
    ? {
        src: urlFor(home.heroImage).width(3200).quality(80).url(),
        blur: home.heroLqip ?? FALLBACK_HERO_BLUR,
        w: home.heroDim?.width ?? 3200,
        h: home.heroDim?.height ?? 2133,
      }
    : { src: "/hero-main.jpg", blur: FALLBACK_HERO_BLUR, w: 3200, h: 2133 };

  // Images that trail the cursor across the big slogan (native aspect, no crop).
  // auto("format") so the preloaded <img> and the trail <img> hit the same URL.
  const trailImgs = Array.from(
    new Set(
      (home?.heroTrailImages ?? [])
        .filter((img) => (img as { asset?: unknown })?.asset)
        .map((img) => urlFor(img).width(600).quality(80).auto("format").url()),
    ),
  );

  // Editable copy + people, with the built-in content as a graceful fallback.
  const heroText =
    home?.homeHeroText || "Family run start to finish construction services";

  const teamLead = family?.teamLead?.image
    ? {
        img: urlFor(family.teamLead.image)
          .width(1600)
          .height(900)
          .fit("crop")
          .url(),
        alt: family.teamLead.alt ?? "",
        people: family.teamLead.people ?? [],
      }
    : fallbackTeamLead;

  const team =
    family?.team && family.team.length > 0
      ? family.team.map((m) => ({
          name: m.name ?? "",
          role: m.role ?? "",
          img: m.image
            ? urlFor(m.image).width(800).height(1000).fit("crop").url()
            : "",
        }))
      : fallbackTeam;

  // Instagram strip — square, cropped, native colour (the tile desaturates in CSS).
  const instaPosts = (home?.instagramPosts ?? [])
    .filter((p) => p.image && (p.image as { asset?: unknown }).asset)
    .map((p) => ({
      img: urlFor(p.image as Parameters<typeof urlFor>[0])
        .width(640)
        .height(640)
        .fit("crop")
        .auto("format")
        .url(),
      url: p.url ?? site.instagram,
    }));

  // Prefer the live Behold feed when its ID is set; otherwise the curated strip.
  const igFeedId = home?.instagramFeedId?.trim() || "";
  const hasInsta = igFeedId !== "" || instaPosts.length > 0;

  return (
    <>
      <HomeChrome projectCount={projects.length} />

      {/* ---------------- Hero ---------------- */}
      {/* Mobile: a tall 80svh crop so the image reads as a proper hero.
          sm+: the uncropped photo at its natural height (scroll for more). */}
      <section
        id="home-hero"
        className="relative h-[80svh] w-full overflow-hidden sm:h-auto"
      >
        {/* scrolls slightly slower than the page (parallax, driven in HomeChrome)
            — a touch of scale gives headroom so the lag never reveals an edge */}
        <Image
          id="home-hero-img"
          src={hero.src}
          alt="A Lows Design & Build living room"
          width={hero.w}
          height={hero.h}
          priority
          placeholder="blur"
          blurDataURL={hero.blur}
          sizes="100vw"
          style={{ transform: "scale(1.08)", willChange: "transform" }}
          className="block h-full w-full object-cover sm:h-auto sm:object-contain"
        />
        {/* subtle bottom gradient so the wordmark + tagline stay legible */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        {/* the hero blurs progressively as you scroll (driven in HomeChrome) */}
        <div
          id="hero-overlay"
          style={{ backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" }}
          className="pointer-events-none absolute inset-0"
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
          <CursorTrail
            images={trailImgs}
            width={220}
            className="mx-auto w-full max-w-[1900px] px-[10%] sm:px-6"
          >
            <h1 className="mx-auto max-w-6xl text-center font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
              <WordReveal text={heroText} />
            </h1>
          </CursorTrail>
        </section>

        {/* ---------------- Featured projects (image cards) ------------- */}
        {/* Transparent: each opaque card wipes over the sticky slogan behind,
            and the slogan shows in the gaps between them. No bottom padding so
            the slogan stays hidden behind the last card at the very end. */}
        {/* z-20 (above the People block) so the last card's hover-scale isn't
            clipped at the bottom by the opaque paper background that follows */}
        {featured.length > 0 && (
          <section className="relative z-20 px-[10%] pt-24 sm:pt-32">
            <div className="space-y-16 sm:space-y-56 lg:space-y-[22rem]">
              {featured.map((p) => (
                <ProjectCard key={p._id} p={p} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Instagram ---------------- */}
        {/* Opaque band that slides up over the pinned slogan — it takes the
            "cover" role, so the People section below it uses normal spacing.
            Live Behold feed if its ID is set, otherwise the curated strip. */}
        {hasInsta && (
          <section className="relative z-10 bg-background pb-32 pt-56 sm:pb-48 sm:pt-[30rem]">
            <div className="mx-auto mb-10 max-w-[1900px] px-[10%] sm:mb-14 sm:px-6">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="label link-underline !text-ink"
              >
                {site.instagramHandle}
              </a>
            </div>
            {igFeedId ? (
              <InstagramFeed feedId={igFeedId} />
            ) : (
              <InstagramStrip posts={instaPosts} profileUrl={site.instagram} />
            )}
          </section>
        )}

        {/* ---------------- People ---------------- */}
        {/* Opaque paper background that slides up over the pinned slogan. When
            the Instagram band is present it already covers the slogan, so this
            uses normal top spacing; otherwise it takes the cover role itself. */}
        <section
          className={`${PAD} relative z-10 bg-background pb-24 sm:pb-32 ${
            instaPosts.length > 0 ? "pt-12 sm:pt-20" : "pt-56 sm:pt-[28rem]"
          }`}
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
                {teamLead.people.map((pp, idx) => (
                  <div key={pp.name}>
                    <DropReveal delay={250 + idx * 120}>
                      <p className="text-base font-medium">{pp.name}</p>
                    </DropReveal>
                    <DropReveal delay={250 + idx * 120 + 130}>
                      <p className="text-sm text-muted">{pp.role}</p>
                    </DropReveal>
                  </div>
                ))}
              </div>
            </div>

            {team.map((m, i) => {
              // a lone last item (odd count) sits in the RIGHT column, left empty
              const lastAlone = i === team.length - 1 && team.length % 2 === 1;
              const isRight = lastAlone || i % 2 === 1;
              return (
                <div key={m.name} className={lastAlone ? "sm:col-start-2" : ""}>
                  {/* right column reveals first; the left only begins once the
                      right has finished its sweep */}
                  <WipeReveal delay={isRight ? 0 : 0.3}>
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
                  <DropReveal delay={isRight ? 120 : 520} wrapClassName="mt-4">
                    <p className="text-base font-medium">{m.name}</p>
                  </DropReveal>
                  <DropReveal delay={(isRight ? 120 : 520) + 130}>
                    <p className="text-sm text-muted">{m.role}</p>
                  </DropReveal>
                </div>
              );
            })}
          </div>
        </div>
        </section>
      </div>
    </>
  );
}
