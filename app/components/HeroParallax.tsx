"use client";

import { useEffect } from "react";

/**
 * Scroll parallax for a hero image: the target element lags the scroll so the
 * content below appears to slide over it. The image should be pre-scaled (e.g.
 * scale(1.18)) and live in an `overflow-hidden` container so the lag never
 * reveals an edge.
 */
export default function HeroParallax({
  targetId,
  containerId,
  scale = 1.34,
}: {
  targetId: string;
  containerId: string;
  scale?: number;
}) {
  // default scale gives enough headroom for the 16% lag
  useEffect(() => {
    const img = document.getElementById(targetId);
    if (!img) return;
    let raf = 0;
    const update = () => {
      const box = document.getElementById(containerId);
      const h = box ? box.offsetHeight : window.innerHeight;
      // strong lag so the next section visibly scrolls up over the hero
      const lag = Math.min(window.scrollY * 0.55, h * 0.16);
      img.style.transform = `translate3d(0, ${lag.toFixed(1)}px, 0) scale(${scale})`;
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
  }, [targetId, containerId, scale]);

  return null;
}
