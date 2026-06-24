"use client";

import { useEffect, useRef } from "react";

// faint → solid ink, driven by each word's position as you scroll. The whole
// block (all paragraphs) is treated as one continuous run of words so the
// lighting flows on seamlessly from one paragraph to the next.
const INK = "66, 73, 82"; // --foreground
const FADED = 0.16;

/**
 * Scroll-linked word reveal: every word lights from faint to solid as it
 * crosses the middle of the viewport (à la the SplitText scrub effect), without
 * GSAP — a single rAF pass over the words, in lock-step with the scroll.
 */
export default function ScrollText({
  paragraphs,
  className = "",
}: {
  paragraphs: string[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => (w.style.color = `rgb(${INK})`));
      return;
    }
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const line = vh * 0.62; // words light as they rise past this line
      const band = vh * 0.18; // how far each word fades in over
      for (const w of words) {
        const top = w.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (line - top) / band));
        const a = (FADED + (1 - FADED) * p).toFixed(3);
        w.style.color = `rgba(${INK}, ${a})`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [paragraphs]);

  return (
    <div ref={ref}>
      {paragraphs.map((para, pi) => (
        <p key={pi} className={`${className} ${pi > 0 ? "mt-8" : ""}`}>
          {para.split(/\s+/).map((word, wi) => (
            <span key={wi} data-w style={{ color: `rgba(${INK}, ${FADED})` }}>
              {word}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
