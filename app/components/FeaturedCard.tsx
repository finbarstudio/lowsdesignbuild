"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/lib/types";

/**
 * A featured-project card on the home page. The image inside the frame drifts
 * with the cursor (a subtle parallax), the whole card lifts on hover, and a
 * soft black gradient + the title/tags reveal (mask up, staggered) on hover.
 */
export default function FeaturedCard({
  p,
  first = false,
}: {
  p: ProjectListItem;
  first?: boolean;
}) {
  const tags = [p.category, p.location, p.year].filter(Boolean).map(String);
  const [t, setT] = useState({ x: 0, y: 0 });
  const raf = useRef(0);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() =>
      setT({ x: -px * 26, y: -py * 26 }),
    );
  }
  function onLeave() {
    cancelAnimationFrame(raf.current);
    setT({ x: 0, y: 0 });
  }

  return (
    <Link
      href={`/projects/${p.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-featured-first={first ? "" : undefined}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-line transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:z-10 hover:scale-[1.03]"
    >
      {/* image drifts with the cursor — slightly scaled so the drift never
          reveals an edge */}
      {p.mainImage && (
        <div
          className="absolute inset-0 transition-transform duration-[400ms] ease-out will-change-transform"
          style={{ transform: `scale(1.08) translate3d(${t.x}px, ${t.y}px, 0)` }}
        >
          <Image
            src={urlFor(p.mainImage).width(1600).height(900).fit("crop").url()}
            alt={[p.title, p.category, p.location].filter(Boolean).join(", ")}
            fill
            sizes="80vw"
            className="object-cover"
          />
        </div>
      )}
      {/* soft black gradient — hidden by default, fades in on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />

      {/* overlay text: title + tags. Hidden by default; on hover they mask in
          bottom-to-top, staggered. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:gap-3 sm:p-8">
        <span className="block overflow-hidden">
          <h3 className="translate-y-full text-2xl font-bold uppercase leading-[1.05] tracking-tight text-white transition-transform duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 sm:text-3xl lg:text-4xl">
            {p.title}
          </h3>
        </span>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t2, i) => (
              <span key={t2} className="block overflow-hidden">
                <span
                  className="pill translate-y-[140%] text-[0.62rem] text-white backdrop-blur-sm transition-transform duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)] [border-width:1px] group-hover:translate-y-0"
                  style={{ transitionDelay: `${120 + i * 90}ms` }}
                >
                  {t2}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
