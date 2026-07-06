"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import WipeReveal from "@/app/components/WipeReveal";

type GItem = { thumb: string; full: string; low: string; lqip?: string };

/**
 * Project gallery: the uniform 2-up grid, plus a click-through lightbox. Clicking
 * a tile opens the image FULL SIZE — the original asset (no crop, no re-encode),
 * contained to fit the viewport. A fast low-res of each image is preloaded and
 * shown instantly while the original loads, so it's never blank.
 *
 * The lightbox is rendered through a portal to <body> so it sits above the fixed
 * nav / project title (they share a stacking context with the gallery otherwise,
 * which trapped the close button underneath).
 */
export default function ProjectGallery({
  images,
  alt,
}: {
  images: GItem[];
  alt: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  // full-res URLs that have already loaded this page-view — those slides show
  // the sharp original IMMEDIATELY, no low-res/blur pass at all
  const loadedFulls = useRef<Set<string>>(new Set());
  const count = images.length;

  useEffect(() => setMounted(true), []);

  // Warm the low-res cache up front so opening any image is instant.
  useEffect(() => {
    images.forEach((im) => {
      const i = new window.Image();
      i.src = im.low;
    });
  }, [images]);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + count) % count)),
    [count],
  );

  // Preload the FULL image for the open slide; show the low-res until it's
  // ready. Already-loaded fulls skip the low-res pass entirely.
  useEffect(() => {
    if (open === null) return;
    const full = images[open].full;
    if (loadedFulls.current.has(full)) {
      setFullReady(true);
      return;
    }
    setFullReady(false);
    const img = new window.Image();
    img.src = full;
    const done = () => {
      loadedFulls.current.add(full);
      setFullReady(true);
    };
    if (img.complete) {
      done();
      return;
    }
    img.addEventListener("load", done);
    return () => img.removeEventListener("load", done);
  }, [open, images]);

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, go]);

  const lightbox =
    open !== null ? (
      <div
        className="lb"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        onClick={close}
      >
        <button
          type="button"
          className="lb__btn lb__close"
          onClick={close}
          aria-label="Close"
        >
          ✕
        </button>

        {count > 1 && (
          <button
            type="button"
            className="lb__btn lb__nav lb__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* full native original; the low-res sits underneath until it loads */}
        <img
          key={open}
          src={fullReady ? images[open].full : images[open].low}
          alt={alt}
          className={`lb__img ${fullReady ? "" : "lb__img--low"}`}
          onClick={(e) => {
            e.stopPropagation();
            if (count > 1) go(1);
          }}
        />

        {count > 1 && (
          <button
            type="button"
            className="lb__btn lb__nav lb__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next image"
          >
            ›
          </button>
        )}

        {!fullReady && (
          <svg
            className="lb__loading"
            aria-hidden="true"
            viewBox="0 0 121.43 86.64"
          >
            <polyline
              className="lb__loading-path"
              points="2 84.64 2 56.06 27.52 38.21 27.52 3.23 96.77 37.67 96.77 3.59 49.38 3.59 49.38 84.64 71.25 84.64 71.25 55.88 119.43 55.88 119.43 84.64"
              pathLength={1}
              fill="none"
            />
          </svg>
        )}

        {count > 1 && (
          <div className="lb__dots" aria-hidden="true">
            {images.map((_, i) => (
              <span
                key={i}
                className={`lb__dot ${i === open ? "is-active" : ""}`}
              />
            ))}
          </div>
        )}

        <style>{css}</style>
      </div>
    ) : null;

  return (
    <>
      {/* Clean, uniform 2-up grid — every tile the same aspect so rows line up.
          Left column reveals just after the right. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {images.map((im, i) => (
          <WipeReveal
            key={i}
            delay={i % 2 === 0 ? 0.3 : 0}
            className="relative aspect-[4/3] overflow-hidden bg-line"
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label="View image full size"
              className="group absolute inset-0 block cursor-zoom-in"
            >
              <Image
                src={im.thumb}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                placeholder={im.lqip ? "blur" : undefined}
                blurDataURL={im.lqip ?? undefined}
                className="object-cover"
              />
            </button>
          </WipeReveal>
        ))}
      </div>

      {mounted && lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}

const css = `
.lb{
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 3vmin;
  background: rgba(18,18,16,0.96);
  animation: lb-fade .28s ease both;
  cursor: pointer; /* the backdrop itself closes — signal it */
  -webkit-tap-highlight-color: transparent;
}
@keyframes lb-fade{ from{ opacity:0 } to{ opacity:1 } }
.lb__img{
  max-width: 94vw; max-height: 88vh;
  width: auto; height: auto;
  object-fit: contain;
  cursor: zoom-out;
  animation: lb-pop .3s cubic-bezier(0.22,1,0.36,1) both;
}
/* while the full-res loads: the low-res shows as-is (no blur), just dimmed a
   touch so the drawing house mark reads over it */
.lb__img--low{ filter: brightness(0.7); }
@keyframes lb-pop{ from{ opacity:0 } to{ opacity:1 } }
/* Bare glyph controls — no bubbles. A soft shadow keeps them legible on any image. */
.lb__btn{
  position: absolute; z-index: 2;
  color: #fff; background: none; border: none; cursor: pointer;
  line-height: 1; padding: 6px;
  font-family: var(--font-sans-stack, sans-serif);
  text-shadow: 0 1px 10px rgba(0,0,0,.55);
  transition: color .2s ease, transform .2s ease;
}
.lb__btn:hover{ color: var(--tertiary); }
.lb__close{ top: 2.4vh; right: 3.5vw; font-size: 26px; }
.lb__nav{ top: 50%; transform: translateY(-50%); font-size: 46px; padding: 6px 10px; }
.lb__nav:hover{ transform: translateY(-50%) scale(1.12); }
.lb__nav--prev{ left: 1.5vw; }
.lb__nav--next{ right: 1.5vw; }
/* full-res load indicator — the LOWS house mark drawing itself on loop (same
   stroke draw as the preloader), riding just above the dots */
.lb__loading{
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 2; pointer-events: none;
  width: 52px; height: 37px;
  overflow: visible;
  filter: drop-shadow(0 1px 8px rgba(0,0,0,.45));
}
.lb__loading-path{
  stroke: rgba(255,255,255,.85);
  stroke-width: 4px;
  stroke-linecap: square;
  stroke-miterlimit: 10;
  stroke-dasharray: 1;
  animation: lb-draw 1.6s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}
@keyframes lb-draw{
  0%   { stroke-dashoffset: 1; opacity: 1; }
  70%  { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
@media (prefers-reduced-motion: reduce){
  .lb__loading-path{ animation: none; stroke-dashoffset: 0; }
}
.lb__dots{
  position: absolute; bottom: 2.4vh; left: 50%; transform: translateX(-50%);
  display: flex; gap: 9px;
}
.lb__dot{
  width: 7px; height: 7px; border-radius: 999px;
  background: rgba(255,255,255,.35);
  transition: background .25s ease, transform .25s ease;
}
.lb__dot.is-active{ background: var(--tertiary); transform: scale(1.3); }
@media (max-width: 640px){
  .lb__nav{ font-size: 34px; }
  .lb__nav--prev{ left: 1vw; }
  .lb__nav--next{ right: 1vw; }
  .lb__close{ font-size: 24px; }
}
@media (prefers-reduced-motion: reduce){
  .lb, .lb__img{ animation: none; }
}
`;
