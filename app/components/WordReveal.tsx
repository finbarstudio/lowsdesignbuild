"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mask-reveals a line one word at a time — each word rises up from behind its
 * own baseline (clip + translateY 110% → 0), heavily staggered so the whole
 * line takes a few seconds to come in. Fires once the text scrolls into view.
 */
export default function WordReveal({
  text,
  className = "",
  stagger = 380,
  duration = 0.9,
}: {
  text: string;
  className?: string;
  /** per-word delay step in ms */
  stagger?: number;
  /** each word's transition duration in seconds */
  duration?: number;
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
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="mr-[0.28em] inline-block overflow-hidden align-bottom"
        >
          <span
            className="inline-block"
            style={{
              transform: shown ? "translateY(0)" : "translateY(110%)",
              transition: `transform ${duration}s cubic-bezier(0.22,1,0.36,1)`,
              transitionDelay: `${i * stagger}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
