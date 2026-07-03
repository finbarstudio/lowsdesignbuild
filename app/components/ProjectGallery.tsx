"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import WipeReveal from "@/app/components/WipeReveal";

type GItem = { thumb: string; full: string; lqip?: string };

/**
 * Project gallery: the uniform 2-up grid, plus a click-through lightbox. Clicking
 * a tile opens the image FULL SIZE — the original asset (no crop, no re-encode),
 * contained to fit the viewport. Click the image (or the arrows / arrow keys) to
 * step through; click the backdrop, hit Escape, or the close button to dismiss.
 */
export default function ProjectGallery({
  images,
  alt,
}: {
  images: GItem[];
  alt: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const count = images.length;

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + count) % count)),
    [count],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    // Freeze the page behind the lightbox (Lenis + native fallback).
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
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
            </button>
          </WipeReveal>
        ))}
      </div>

      {open !== null && (
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
            ×
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

          {/* raw <img> with the original asset — full native quality, no crop */}
          <img
            key={open}
            src={images[open].full}
            alt={alt}
            className="lb__img"
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

          {count > 1 && (
            <div className="lb__count">
              {open + 1} / {count}
            </div>
          )}

          <style>{css}</style>
        </div>
      )}
    </>
  );
}

const css = `
.lb{
  position: fixed; inset: 0; z-index: 90;
  display: flex; align-items: center; justify-content: center;
  padding: 3vmin;
  background: rgba(18,18,16,0.95);
  animation: lb-fade .28s ease both;
  -webkit-tap-highlight-color: transparent;
}
@keyframes lb-fade{ from{ opacity:0 } to{ opacity:1 } }
.lb__img{
  max-width: 94vw; max-height: 94vh;
  width: auto; height: auto;
  object-fit: contain;
  cursor: zoom-out;
  box-shadow: 0 24px 80px -20px rgba(0,0,0,.6);
  animation: lb-pop .3s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes lb-pop{ from{ opacity:0; transform: scale(.985) } to{ opacity:1; transform: none } }
.lb__btn{
  position: absolute; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  color: #fff; background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 999px; cursor: pointer;
  line-height: 1; font-family: var(--font-sans-stack, sans-serif);
  transition: background .25s ease, border-color .25s ease, transform .25s ease;
}
.lb__btn:hover{ background: rgba(255,255,255,.16); border-color: rgba(255,255,255,.35); }
.lb__close{
  top: 3vmin; right: 3vmin;
  width: 44px; height: 44px; font-size: 26px;
}
.lb__nav{
  top: 50%; transform: translateY(-50%);
  width: 52px; height: 52px; font-size: 30px; padding-bottom: 4px;
}
.lb__nav:hover{ transform: translateY(-50%) scale(1.06); }
.lb__nav--prev{ left: 3vmin; }
.lb__nav--next{ right: 3vmin; }
.lb__count{
  position: absolute; bottom: 3vmin; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,.8);
  font-family: var(--font-mono-stack, monospace);
  font-size: 12px; letter-spacing: .14em;
}
@media (max-width: 640px){
  .lb__nav{ width: 44px; height: 44px; font-size: 26px; }
  .lb__nav--prev{ left: 2vmin; }
  .lb__nav--next{ right: 2vmin; }
}
@media (prefers-reduced-motion: reduce){
  .lb, .lb__img{ animation: none; }
}
`;
