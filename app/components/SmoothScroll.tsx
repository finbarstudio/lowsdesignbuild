"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll (the inertial feel from merlinlabs / renderedreality).
 * Disabled on /studio so the CMS scrolls normally.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/studio")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Tuned to the buttery, slightly heavy glide of studioagriculture.co:
    // a longer ease with an exponential-out curve and a lightly damped wheel.
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
