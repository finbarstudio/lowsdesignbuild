import { FOOT, PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Link from "next/link";

import ProjectsGrid from "@/app/components/ProjectsGrid";
import ScrollNudge from "@/app/components/ScrollNudge";
import WordReveal from "@/app/components/WordReveal";
import { client } from "@/sanity/lib/client";
import { PROJECTS_PAGE_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { ProjectListItem, ProjectsPage } from "@/sanity/lib/types";

export const revalidate = 60;


export const metadata: Metadata = {
  title: "Projects",
  description:
    "Loft conversions, extensions and refurbishments across South London by Lows Design & Build.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [projects, page] = await Promise.all([
    client.fetch<ProjectListItem[]>(PROJECTS_QUERY),
    client.fetch<ProjectsPage | null>(PROJECTS_PAGE_QUERY),
  ]);

  return (
    <main>
      <ScrollNudge />

      {/* Hero — full screen, big word-by-word reveal like the other pages */}
      <section
        className={`${PAD} flex min-h-[100svh] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text={page?.heroText || "Our pride is in our projects"} />
        </h1>
        <p className="mt-10 max-w-xl text-base leading-relaxed text-muted sm:mt-14 sm:text-lg">
          {page?.heroIntro ||
            "A selection of recent loft conversions, extensions and full refurbishments across London and surrounding areas."}
        </p>
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
