"use client";

import { useEffect } from "react";

/**
 * Depth-on-leave for a (sticky) hero image. The image holds for the first ~10%
 * of scroll (so the hero stays full-height and any overlaid text stays put),
 * then gently scales down, drifts up and fades — so it reads as falling away
 * into the distance while the next section scrolls up over it. The image must
 * start slightly zoomed (startScale) so scaling down never reveals an edge.
 */
export default function HeroDepth({
  targetId,
  startScale = 1.34,
  endScale = 1.12,
  fade = 0.35,
  rise = 48,
  hold = 0.1,
  span = 0.75,
}: {
  targetId: string;
  startScale?: number;
  endScale?: number;
  fade?: number;
  rise?: number;
  hold?: number;
  span?: number;
}) {
  useEffect(() => {
    const img = document.getElementById(targetId);
    if (!img) return;
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const q = Math.min(
        1,
        Math.max(0, (window.scrollY - vh * hold) / (vh * span)),
      );
      const eq = q * q * (3 - 2 * q); // smoothstep
      const s = startScale + (endScale - startScale) * eq;
      img.style.transform = `translate3d(0, ${(-eq * rise).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      img.style.opacity = `${(1 - fade * eq).toFixed(3)}`;
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
  }, [targetId, startScale, endScale, fade, rise, hold, span]);

  return null;
}
