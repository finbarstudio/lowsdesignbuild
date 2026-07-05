"use client";

import { useEffect } from "react";

type LenisLike = {
  scrollTo: (
    target: number,
    opts?: { duration?: number; easing?: (t: number) => number },
  ) => void;
};

/**
 * Demo auto-scroll for social recordings: with `?autoscroll=1` in the URL the
 * page glides from top to bottom and back, forever. Used by the launch-post
 * deck's phone-frame scene (it iframes the site — cross-origin pages can't be
 * scrolled from outside, so the site scrolls itself). Inert without the param.
 */
export default function AutoTour() {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("autoscroll")) return;

    let stop = false;
    let timer = 0;
    const DOWN_MS = 16000;
    const PAUSE_MS = 1200;

    const glide = (target: number, ms: number, then: () => void) => {
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis) {
        lenis.scrollTo(target, {
          duration: ms / 1000,
          easing: (t) => 1 - Math.pow(1 - t, 2),
        });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
      timer = window.setTimeout(then, ms + PAUSE_MS);
    };

    const loop = () => {
      if (stop) return;
      const bottom =
        document.documentElement.scrollHeight - window.innerHeight;
      glide(bottom, DOWN_MS, () => {
        if (stop) return;
        glide(0, DOWN_MS * 0.6, loop);
      });
    };

    // let the entrance play first
    timer = window.setTimeout(loop, 2600);
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
