"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Splits a line into words and mask-reveals each word individually — every word
 * rises up from behind its own baseline (clip + translateY 110% → 0), staggered
 * left-to-right. Fires once the text scrolls into view.
 */
export default function WordReveal({
  text,
  className = "",
  stagger = 60,
}: {
  text: string;
  className?: string;
  /** per-word delay step in ms */
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let raf = 0;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        setShown(true);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const words = text.split(" ");

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="mr-[0.28em] inline-block overflow-hidden align-bottom"
        >
          <span
            className="inline-block"
            style={{
              transform: shown ? "translateY(0)" : "translateY(110%)",
              transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: `${i * stagger}ms`,
            }}
          >
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}
