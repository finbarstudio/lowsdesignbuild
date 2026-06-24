import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";

import FeaturedCard from "@/app/components/FeaturedCard";
import HomeChrome from "@/app/components/HomeChrome";
import InstagramFeed from "@/app/components/InstagramFeed";
import InstagramStrip from "@/app/components/InstagramStrip";
import ProcessPath from "@/app/components/ProcessPath";
import StickySlogan from "@/app/components/StickySlogan";
import WordReveal from "@/app/components/WordReveal";
import Wordmark from "@/app/components/Wordmark";
import { processSteps as fallbackProcess, site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { HOME_PAGE_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { HomePage, ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;

// Tiny base64 blur of the bundled hero, used as an instant placeholder when no
// CMS hero is set (so there is always something on screen immediately).
const FALLBACK_HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAEAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAEAAYAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAv/aAAwDAQACEQMRAD8Ap2V7cRRCRSu3oeeh/wD1Vrpq1wFLyAbVzkjvgZ45rEtoZpYm6jf06e3t/StSS1lKhgORn5exyMc8VxyZvFF7U5Slr5x5BGcd+lcr/aC/88z+f/1q6a/lgltfJnUqMfr+Fc59l07+8fzqLy6Cle+h/9k=";

export const metadata: Metadata = {
  description:
    "Family-run design & build across South London. Loft conversions, extensions and refurbishments, from the first drawing through to completion.",
};


export default async function HomePage() {
  const [projects, home] = await Promise.all([
    client.fetch<ProjectListItem[]>(PROJECTS_QUERY),
    client.fetch<HomePage | null>(HOME_PAGE_QUERY),
  ]);
  // Curated in the CMS (Home Page → Featured projects) when set; otherwise the
  // first three projects.
  const featured =
    home?.featuredProjects && home.featuredProjects.length > 0
      ? home.featuredProjects
      : projects.slice(0, 3);

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

  // Editable copy + people, with the built-in content as a graceful fallback.
  const heroText =
    home?.homeHeroText ||
    "Family Run Construction Services in London and Surrounding Areas";

  // 'Our process' steps (edited under Home Page in the CMS).
  const steps =
    home?.processSteps && home.processSteps.length > 0
      ? home.processSteps.map((s, i) => ({
          n: String(i + 1).padStart(2, "0"),
          title: s.title ?? "",
          text: s.text ?? "",
        }))
      : fallbackProcess;

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
      <section
        id="home-hero"
        className="relative h-[100svh] w-full overflow-hidden"
      >
        {home?.heroVideoUrl ? (
          /* Video hero — loops silently, covers the viewport. Depth driven by
             HomeChrome the same way as the image (targets #home-hero-img). */
          <video
            id="home-hero-img"
            src={home.heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ transform: "scale(1.06)", willChange: "transform, opacity" }}
            className="absolute left-0 top-0 h-full w-full object-cover"
          />
        ) : (
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
            style={{ transform: "scale(1.06)", willChange: "transform, opacity" }}
            className="absolute left-0 top-0 h-full w-full object-cover"
          />
        )}
        {/* same gradient as the project hero, so the wordmark stays legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
        {/* Mobile: the LOWS wordmark sits on the hero image (desktop has the
            sliding wordmark instead, so this is hidden there). */}
        <Wordmark className="pointer-events-none absolute bottom-7 left-4 z-10 h-[58px] w-[128px] text-white sm:hidden" />
      </section>

      {/* Sticky statement + featured projects share a wrapper so the pinned
          slogan is contained here; it releases and scrolls away once the
          featured block ends, never overlapping the sections below. */}
      <div className="relative z-10">
        {/* ---------------- Family-run statement (Futura) ---------------- */}
        <section className="sticky top-0 flex h-[100svh] flex-col items-center justify-center">
          {/* On mobile the slogan is inset to the same 10% as the project
              thumbnails below so the wide caps never spill past their edges.
              It fades out as the first featured thumbnail covers it. */}
          <StickySlogan>
            <div className="mx-auto w-full max-w-[1900px] px-[10%] sm:px-6">
              <h1 className="mx-auto max-w-6xl text-center font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
                <WordReveal text={heroText} />
              </h1>
            </div>
          </StickySlogan>
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
              {featured.map((p, i) => (
                <FeaturedCard key={p._id} p={p} first={i === 0} />
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
            <div className="mb-6 px-4 sm:mb-14 sm:px-6">
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

        {/* ---------------- Our process ---------------- */}
        {/* Opaque paper background that slides up over the pinned slogan. When
            the Instagram band is present it already covers the slogan, so this
            uses normal top spacing; otherwise it takes the cover role itself.
            (Swapped in from the about page, in place of the team.) */}
        <section
          className={`${PAD} relative z-10 bg-background pb-24 sm:pb-32 ${
            instaPosts.length > 0 ? "pt-12 sm:pt-20" : "pt-56 sm:pt-[28rem]"
          }`}
        >
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="label sticky top-24 !text-ink">Our process</h2>
            </div>
            <div className="lg:col-span-2">
              <ProcessPath steps={steps} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
