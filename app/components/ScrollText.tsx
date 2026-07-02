"use client";

import { useEffect, useRef } from "react";

// faint → solid, driven by each word's position as you scroll. The whole block
// (all paragraphs) is treated as one continuous run of words so the lighting
// flows on seamlessly from one paragraph to the next. `tone="gold"` lights the
// words in copper instead of ink — used for the lead-in line.
const INK = "66, 73, 82"; // --foreground
const GOLD = "169, 126, 31"; // --tertiary

/**
 * Scroll-linked word reveal: every word lights from faint to solid as it
 * crosses the middle of the viewport (à la the SplitText scrub effect), without
 * GSAP — a single rAF pass over the words, in lock-step with the scroll.
 */
export default function ScrollText({
  paragraphs,
  className = "",
  tone = "ink",
}: {
  paragraphs: string[];
  className?: string;
  tone?: "ink" | "gold";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rgb = tone === "gold" ? GOLD : INK;
    const faded = tone === "gold" ? 0.26 : 0.16;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => (w.style.color = `rgb(${rgb})`));
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
        const a = (faded + (1 - faded) * p).toFixed(3);
        w.style.color = `rgba(${rgb}, ${a})`;
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
  }, [paragraphs, tone]);

  const initial = tone === "gold" ? 0.26 : 0.16;
  const rgb = tone === "gold" ? GOLD : INK;

  return (
    <div ref={ref}>
      {paragraphs.map((para, pi) => (
        <p key={pi} className={`${className} ${pi > 0 ? "mt-8" : ""}`}>
          {para.split(/\s+/).map((word, wi) => (
            <span key={wi} data-w style={{ color: `rgba(${rgb}, ${initial})` }}>
              {word}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
