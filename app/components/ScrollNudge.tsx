"use client";

import { useEffect } from "react";

/**
 * After the on-load text animations have settled, gently nudges the page down a
 * little so the start of the content below the hero peeks into view — a hint
 * that there's more to scroll. Backs off if the visitor has already scrolled, or
 * if they prefer reduced motion.
 */
type LenisLike = {
  scrollTo: (
    target: number,
    opts?: { duration?: number; easing?: (t: number) => number },
  ) => void;
};

export default function ScrollNudge({
  delay = 1700,
  vh = 0.3,
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
      const target = window.innerHeight * vh;
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis) {
        // ride Lenis for a long, gentle ease that matches the site's glide
        lenis.scrollTo(target, {
          duration: 2.2,
          easing: (p) => 1 - Math.pow(1 - p, 3),
        });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [delay, vh]);

  return null;
}
