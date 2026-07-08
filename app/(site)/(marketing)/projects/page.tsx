import { FOOT, PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Link from "next/link";

import HeroIntro from "@/app/components/HeroIntro";
import ProjectsGrid from "@/app/components/ProjectsGrid";
import WordReveal from "@/app/components/WordReveal";
import { ogFor } from "@/app/lib/site";
import { client } from "@/sanity/lib/client";
import { PROJECTS_PAGE_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { ProjectListItem, ProjectsPage } from "@/sanity/lib/types";

export const revalidate = 60;


export const metadata: Metadata = {
  title: "Projects",
  description:
    "Loft conversions, extensions and refurbishments across South London by Lows Design & Build.",
  alternates: { canonical: "/projects" },
  openGraph: ogFor(
    "Projects · Lows Design & Build",
    "Loft conversions, extensions and refurbishments across South London by Lows Design & Build.",
    "/projects",
  ),
};

export default async function ProjectsPage() {
  const [projects, page] = await Promise.all([
    client.fetch<ProjectListItem[]>(PROJECTS_QUERY),
    client.fetch<ProjectsPage | null>(PROJECTS_PAGE_QUERY),
  ]);

  const heroText = page?.heroText || "Our pride is in our projects";

  return (
    <main id="main-content">
      {/* Hero — full screen, big word-by-word reveal first; the intro fades in
          only after the slogan has finished */}
      <section
        className={`${PAD} flex min-h-[100svh] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text={heroText} />
        </h1>
        <HeroIntro delay={heroText.split(" ").length * 160 + 500}>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-muted sm:mt-14 sm:text-lg">
            {page?.heroIntro ||
              "A selection of recent loft conversions, extensions and full refurbishments across London and surrounding areas."}
          </p>
        </HeroIntro>
      </section>

      {/* Grid — full-bleed portrait cards. The image fills a frame whose aspect
          sits between 9:16 and A4; on hover the image's bottom edge crops up
          (clip-path inset, no scale) to reveal the title + location/type pills
          sitting beneath it. */}
      <section className={`${FOOT} pt-16 sm:pt-24`}>
        {projects.length === 0 ? (
          <div className={`${PAD}`}>
            <div className="border border-dashed border-line p-12 text-center">
              <p className="text-xl font-semibold tracking-tight">
                New projects coming soon
              </p>
              <p className="mt-3 text-sm text-muted">
                <Link href="/contact" className="link link-underline is-tracked">
                  Get in touch
                </Link>{" "}
                to discuss yours.
              </p>
            </div>
          </div>
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </section>
    </main>
  );
}
