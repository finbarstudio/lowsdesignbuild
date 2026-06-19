"use client";

import { useEffect } from "react";

/**
 * After the on-load text animations have settled, gently nudges the page down a
 * little so the start of the content below the hero peeks into view — a hint
 * that there's more to scroll. Backs off if the visitor has already scrolled, or
 * if they prefer reduced motion.
 */
export default function ScrollNudge({
  delay = 1700,
  vh = 0.15,
}: {
  /** ms to wait (until the text reveal has finished) before nudging */
  delay?: number;
  /** how far to nudge, as a fraction of the viewport height */
  vh?: number;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      if (window.scrollY > 4) return; // visitor already scrolled — don't hijack
      window.scrollTo({ top: window.innerHeight * vh, behavior: "smooth" });
    }, delay);
    return () => window.clearTimeout(t);
  }, [delay, vh]);

  return null;
}
