"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mask-reveals a line one word at a time — each word rises up from behind its
 * own baseline (clip + translateY 110% → 0), heavily staggered so the whole
 * line takes a few seconds to come in. Fires once the text scrolls into view.
 */
export default function WordReveal({
  text,
  items,
  label,
  className = "",
  stagger = 160,
  duration = 0.7,
}: {
  text?: string;
  /** mixed tokens (words and/or elements) to reveal one by one; overrides text */
  items?: React.ReactNode[];
  /** aria-label when using items */
  label?: string;
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

  const tokens: React.ReactNode[] = items ?? (text ?? "").split(" ");

  // Manual kern offsets for problem pairs (applied after CSS uppercase transform,
  // so we match against the uppercased form). Values in em — negative = tighter.
  const KERN: Record<string, number> = {
    FA: -0.06,
    LY: -0.07,
    TA: -0.05,
  };

  function kernedWord(word: string) {
    const chars = word.toUpperCase().split("");
    return word.split("").map((ch, i) => {
      const pair = chars[i] + (chars[i + 1] ?? "");
      const offset = KERN[pair];
      return (
        <span
          key={i}
          style={offset !== undefined ? { marginRight: `${offset}em` } : undefined}
        >
          {ch}
        </span>
      );
    });
  }

  return (
    <span ref={ref} className={className} aria-label={label ?? text}>
      {tokens.map((tok, i) => (
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
            {typeof tok === "string" ? kernedWord(tok) : tok}
          </span>
        </span>
      ))}
    </span>
  );
}
