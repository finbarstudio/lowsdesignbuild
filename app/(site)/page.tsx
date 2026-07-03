import { FOOT, PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";

import HomeChrome from "@/app/components/HomeChrome";
import InstagramFeed from "@/app/components/InstagramFeed";
import InstagramStrip from "@/app/components/InstagramStrip";
import ProcessConverge from "@/app/components/ProcessConverge";
import ProcessPath from "@/app/components/ProcessPath";
import StickySlogan from "@/app/components/StickySlogan";
import ViewProjectsButton from "@/app/components/ViewProjectsButton";
import WordReveal from "@/app/components/WordReveal";
import Wordmark from "@/app/components/Wordmark";
import { processSteps as fallbackProcess, site } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { HOME_PAGE_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { HomePage, ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  description:
    "Family-run design & build across South London. Loft conversions, extensions and refurbishments, from the first drawing through to completion.",
};


export default async function HomePage() {
  const [projects, home] = await Promise.all([
    client.fetch<ProjectListItem[]>(PROJECTS_QUERY),
    client.fetch<HomePage | null>(HOME_PAGE_QUERY),
  ]);

  // Hero from the CMS when set. A low-res of the same image loads instantly as a
  // sharp base; the full-res (priority) silently swaps in on top once loaded —
  // usually before the preloader even lifts, given it has ~3s to fetch.
  const hero = home?.heroImage
    ? {
        src: urlFor(home.heroImage).width(3200).quality(80).url(),
        low: urlFor(home.heroImage).width(768).quality(45).url(),
        w: home.heroDim?.width ?? 3200,
        h: home.heroDim?.height ?? 2133,
      }
    : { src: "/hero-main.jpg", low: "/hero-main.jpg", w: 3200, h: 2133 };

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
          /* Low-res base loads instantly as a sharp background; the full-res
             image (priority) silently covers it once loaded. */
          <div
            id="home-hero-img"
            className="absolute left-0 top-0 h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url("${hero.low}")`,
              transform: "scale(1.06)",
              willChange: "transform, opacity",
            }}
          >
            <Image
              src={hero.src}
              alt="A Lows Design & Build living room"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        {/* same gradient as the project hero, so the wordmark stays legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
        {/* top scrim — stronger dark gradient so the nav / logomark read clearly
            over ANY hero image (light skies etc.). Taller + darker than before. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/85 via-black/45 to-transparent sm:h-72" />
        {/* The LOWS wordmark sits centred on the hero (all sizes now — there's no
            longer a desktop sliding wordmark). It rises in during the entrance via
            the .logo-mask clip; the wrapper owns the centring transform so the
            inner mask can slide up without fighting it. */}
        <div className="logo-mask pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Wordmark className="h-[96px] w-[211px] text-white sm:h-[150px] sm:w-[330px] lg:h-[184px] lg:w-[405px]" />
        </div>
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

        {/* ---------------- Our process ---------------- */}
        {/* No background: the pinned slogan behind fades out naturally (via
            StickySlogan) as this rises. The winding timeline, then the end
            sequence: the four items converge into a pinned 2×2 with the View
            projects button, which the Instagram section scrolls up OVER. */}
        <section
          data-featured-first
          className={`${PAD} relative z-10 pb-6 pt-28 sm:pb-10 sm:pt-44`}
        >
          <ProcessPath steps={steps} />
        </section>

        {/* end sequence — MUST be a direct child of this wrapper (not inside the
            section above) so its pinned stage stays put while Instagram covers it */}
        <ProcessConverge steps={steps} button={<ViewProjectsButton />} />

        {/* ---------------- Instagram ---------------- */}
        {/* Live Behold feed if its ID is set, otherwise the curated strip. */}
        {hasInsta && (
          <section
            className={`relative z-10 bg-background pt-8 sm:pt-16 ${FOOT}`}
          >
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
      </div>
    </>
  );
}
