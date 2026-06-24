"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/lib/types";

/**
 * A featured-project card. The image drifts subtly with the cursor, and on hover
 * a soft "lens" forms around the pointer: a large area stays sharp while the rest
 * eases into a faint blur + chromatic fringe, lifted by a gentle spotlight — so
 * the parallax reads as one cohesive depth effect rather than a flat slide.
 */
export default function FeaturedCard({
  p,
  first = false,
}: {
  p: ProjectListItem;
  first?: boolean;
}) {
  const tags = [p.category, p.location, p.year].filter(Boolean).map(String);
  const [hover, setHover] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const src = p.mainImage
    ? urlFor(p.mainImage).width(1600).height(900).fit("crop").url()
    : "";
  const alt = [p.title, p.category, p.location].filter(Boolean).join(", ");

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (wrapRef.current) {
        wrapRef.current.style.transform = `scale(1.07) translate3d(${(-(px - 0.5) * 12).toFixed(1)}px, ${(-(py - 0.5) * 12).toFixed(1)}px, 0)`;
      }
      const cx = (px * 100).toFixed(1);
      const cy = (py * 100).toFixed(1);
      const mask = `radial-gradient(circle at ${cx}% ${cy}%, transparent 30%, black 66%)`;
      if (overlayRef.current) {
        overlayRef.current.style.maskImage = mask;
        overlayRef.current.style.webkitMaskImage = mask;
      }
      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(circle at ${cx}% ${cy}%, rgba(255,255,255,0.4), transparent 60%)`;
      }
    });
  }
  function onLeave() {
    setHover(false);
    cancelAnimationFrame(raf.current);
    if (wrapRef.current) {
      wrapRef.current.style.transform = "scale(1.07) translate3d(0,0,0)";
    }
  }

  return (
    <Link
      href={`/projects/${p.slug}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      data-featured-first={first ? "" : undefined}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-line transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:z-10 hover:scale-[1.03] active:scale-[0.99] active:duration-100"
    >
      {/* the chromatic-aberration filter, defined once (on the first card) */}
      {first ? (
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="lows-ca" x="-5%" y="-5%" width="110%" height="110%">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="r"
            />
            <feOffset in="r" dx="1" dy="0" result="ro" />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="g"
            />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="b"
            />
            <feOffset in="b" dx="-1" dy="0" result="bo" />
            <feBlend in="ro" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="bo" mode="screen" />
          </filter>
        </svg>
      ) : null}

      {p.mainImage && (
        <div
          ref={wrapRef}
          className="absolute inset-0 transition-transform duration-[400ms] ease-out will-change-transform"
          style={{ transform: "scale(1.07)" }}
        >
          {/* sharp base */}
          <Image
            src={src}
            alt={alt}
            fill
            sizes="80vw"
            placeholder={p.lqip ? "blur" : undefined}
            blurDataURL={p.lqip ?? undefined}
            className="object-cover"
          />
          {/* blurred + chromatic overlay, masked away from the cursor, faded in
              on hover so the area around the pointer stays sharp */}
          <div
            ref={overlayRef}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: hover ? 1 : 0 }}
          >
            <Image
              src={src}
              alt=""
              aria-hidden="true"
              fill
              sizes="80vw"
              className="object-cover [filter:url(#lows-ca)_blur(2px)]"
            />
          </div>
        </div>
      )}

      {/* soft spotlight around the cursor */}
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-500"
        style={{ opacity: hover ? 1 : 0 }}
      />

      {/* soft black gradient + title/tags reveal */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
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
