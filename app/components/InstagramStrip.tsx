"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";

type Post = { img: string; url: string };

/**
 * A horizontally-scrolling row of Instagram posts. It auto-scrolls (a JS rAF
 * nudging scrollLeft, so it never sticks like a CSS :hover-paused marquee), and
 * because it's a real scroll container you can also swipe/drag through it on
 * mobile. Auto-scroll pauses while you interact, then resumes. Photos are full
 * colour on touch; on desktop they sit in grayscale and bloom to colour on hover.
 */
export default function InstagramStrip({
  posts,
  profileUrl,
}: {
  posts: Post[];
  profileUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // duplicate the set so the loop is seamless when scrollLeft wraps
  const track = posts.length ? [...posts, ...posts] : [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let paused = false;
    let resumeTimer = 0;
    let pos = el.scrollLeft; // float accumulator (scrollLeft alone can round 0.5 away)
    const SPEED = 0.6; // px per frame (~36px/s)

    const tick = () => {
      const half = el.scrollWidth / 2;
      if (paused || half <= 0) {
        pos = el.scrollLeft; // stay in sync with manual scrolling
      } else {
        pos += SPEED;
        if (pos >= half) pos -= half; // wrap seamlessly
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      paused = true;
      window.clearTimeout(resumeTimer);
    };
    const resume = () => {
      paused = false;
    };
    const resumeSoon = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => (paused = false), 1800);
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resumeSoon, { passive: true });
    el.addEventListener("pointerup", resumeSoon);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resumeTimer);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resumeSoon);
      el.removeEventListener("pointerup", resumeSoon);
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <div
      ref={ref}
      className="no-scrollbar flex gap-3 overflow-x-auto px-[10%] sm:gap-4 sm:px-6"
    >
      {track.map((p, i) => (
        <a
          key={i}
          href={p.url || profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on Instagram"
          className="group/tile relative block aspect-square w-44 shrink-0 overflow-hidden bg-line sm:w-56 lg:w-64"
        >
          <img
            src={p.img}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-700 ease-out lg:grayscale lg:group-hover/tile:scale-105 lg:group-hover/tile:grayscale-0"
          />
        </a>
      ))}
    </div>
  );
}
