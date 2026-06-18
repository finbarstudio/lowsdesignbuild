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
    // Always start a new route at the very top — Lenis otherwise keeps its own
    // virtual scroll position and "remembers" where the last page was.
    window.scrollTo(0, 0);

    if (pathname?.startsWith("/studio")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch devices already scroll with native inertia. Running Lenis on top of
    // that fights the browser and feels laggy/jagged on mobile, so we leave
    // phones and tablets on their native scroll and only smooth on pointers.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Tuned to the buttery, slightly heavy glide of studioagriculture.co:
    // a longer ease with an exponential-out curve and a lightly damped wheel.
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });
    lenis.scrollTo(0, { immediate: true });
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
