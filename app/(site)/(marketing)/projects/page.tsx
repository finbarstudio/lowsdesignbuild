import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ScrollNudge from "@/app/components/ScrollNudge";
import WordReveal from "@/app/components/WordReveal";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;


export const metadata: Metadata = {
  title: "Projects",
  description:
    "Loft conversions, extensions and refurbishments across South London by Lows Design & Build.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await client.fetch<ProjectListItem[]>(PROJECTS_QUERY);

  return (
    <main>
      <ScrollNudge />

      {/* Hero — full screen, big word-by-word reveal like the other pages */}
      <section
        className={`${PAD} flex min-h-[100svh] flex-col items-center justify-center text-center`}
      >
        <h1 className="mx-auto max-w-6xl font-sans text-3xl font-bold uppercase leading-[1.05] sm:text-6xl sm:tracking-tight lg:text-7xl">
          <WordReveal text="Our pride is in our projects" />
        </h1>
        <p className="mt-10 max-w-xl text-base leading-relaxed text-muted sm:mt-14 sm:text-lg">
          A selection of recent loft conversions, extensions and full
          refurbishments across South London and Kent.
        </p>
      </section>

      {/* Grid — full-bleed portrait cards. The image fills a frame whose aspect
          sits between 9:16 and A4; on hover the image's bottom edge crops up
          (clip-path inset, no scale) to reveal the title + location/type pills
          sitting beneath it. */}
      <section className="py-16 sm:py-24">
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
          <div className="grid w-screen grid-cols-1 gap-[2px] bg-background sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const meta = [p.category, p.location].filter(Boolean);
              return (
                <Link
                  key={p._id}
                  href={`/projects/${p.slug}`}
                  className="group relative block h-[56vw] overflow-hidden bg-background sm:h-[42vw] lg:h-[70vh]"
                >
                  {/* caption sitting behind the image, anchored to the bottom —
                      revealed as the image crops up on hover. Title + each pill
                      mask-reveal (slide up out of their own clip) on a stagger. */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-7 sm:p-9">
                    <span className="block overflow-hidden">
                      <h2 className="line-clamp-2 translate-y-full text-2xl font-bold uppercase leading-[1.05] tracking-tight transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:80ms] group-hover:translate-y-0 sm:text-3xl">
                        {p.title}
                      </h2>
                    </span>
                    {meta.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {meta.map((m, i) => (
                          <span key={m} className="block overflow-hidden">
                            <span
                              className="pill translate-y-[140%] text-ink transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                              style={{ transitionDelay: `${200 + i * 110}ms` }}
                            >
                              {m}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* hero image on top — crops up from the bottom on hover. The
                      reveal (hover-in) is gentle; the return down is faster and
                      snappier (shorter base duration + sharper ease). */}
                  {p.mainImage && (
                    <Image
                      src={urlFor(p.mainImage).width(1100).height(1730).fit("crop").url()}
                      alt={[p.title, p.category, p.location]
                        .filter(Boolean)
                        .join(", ")}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover [clip-path:inset(0_0_0_0)] transition-[clip-path] duration-[320ms] ease-[cubic-bezier(0.4,0,0.1,1)] group-hover:[clip-path:inset(0_0_11rem_0)] group-hover:duration-[520ms] group-hover:ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
