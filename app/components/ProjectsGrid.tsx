"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import ColourSwatches from "@/app/components/ColourSwatches";
import { deriveColours } from "@/app/lib/colours";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/lib/types";

/**
 * The projects grid + a basic "project type" filter. The filter buttons are
 * derived from the categories that actually exist on published projects — so a
 * type only gets a button once at least one project uses it (CMS-controlled by
 * simply tagging projects). No projects of a type → no button for it.
 */
export default function ProjectsGrid({
  projects,
}: {
  projects: ProjectListItem[];
}) {
  // unique categories, in the order projects come back (already ordered in GROQ)
  const types = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of projects) {
      const c = p.category?.trim();
      if (c && !seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
    return out;
  }, [projects]);

  const [active, setActive] = useState<string>("all");

  const shown =
    active === "all"
      ? projects
      : projects.filter((p) => p.category?.trim() === active);

  return (
    <>
      {/* Filter — only render when there's more than one type to choose between */}
      {types.length > 1 && (
        <div className="px-[10%] pb-10 sm:px-6 sm:pb-14">
          <div className="mx-auto flex max-w-[1900px] flex-wrap gap-x-7 gap-y-3 font-mono text-xs uppercase tracking-[0.14em] sm:text-sm">
            {[{ key: "all", label: "All" }, ...types.map((t) => ({ key: t, label: t }))].map(
              (t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActive(t.key)}
                  className={`link-underline pb-1 transition-colors ${
                    active === t.key
                      ? "link-active text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <div className="grid w-screen grid-cols-1 gap-[2px] bg-background sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => {
          const meta = [p.category, p.location, p.year].filter(Boolean);
          const swatch = deriveColours(p.palette ?? null, p.heroPalette ?? null)
            .slice(0, 3)
            .map((c) => c.hex);
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
                  alt={[p.title, p.category, p.location].filter(Boolean).join(", ")}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover [clip-path:inset(0_0_0_0)] transition-[clip-path] duration-[320ms] ease-[cubic-bezier(0.4,0,0.1,1)] group-hover:[clip-path:inset(0_0_11rem_0)] group-hover:duration-[520ms] group-hover:ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              )}

              {/* first 3 hero colours, rectangular, wiping in L→R top-left */}
              {swatch.length > 0 && <ColourSwatches colours={swatch} />}
            </Link>
          );
        })}

        {/* Closing CTA — fills whatever column comes next after the last
            project, so the grid always ends on a clean tile. */}
        <Link
          href="/estimate"
          className="group flex h-[56vw] flex-col items-center justify-center bg-background p-7 text-center text-ink sm:h-[42vw] sm:p-9 lg:h-[70vh]"
        >
          <h2 className="text-2xl font-bold uppercase leading-[1.05] tracking-tight sm:text-3xl">
            Have a similar project?
          </h2>
          <span className="link link-underline is-tracked mt-6">
            Reach out for a free estimate
          </span>
        </Link>
      </div>
    </>
  );
}
