"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-TRIGGERED wipe reveal. The clip-path (right→left) starts when the
 * element scrolls into the trigger zone, then always animates through to
 * completion — even if you scroll back up mid-reveal it never gets stuck part
 * way. The finish duration is derived from the scroll velocity at the moment it
 * triggered, so a fast scroll snaps it shut and a slow scroll eases it in.
 */
export default function WipeReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** shifts the trigger later (fractions of the viewport) to stagger a row */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.clipPath = "inset(0 0 0 0)";
      return;
    }

    let raf = 0;
    let animRaf = 0;
    let triggered = false;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0; // px per ms

    const smoothstep = (x: number) => x * x * (3 - 2 * x);

    const finish = () => {
      const vh = window.innerHeight;
      const span = vh * 0.28; // the scroll span the reveal used to map across
      const v = Math.max(vel, 0.18); // floor so a slow/paused scroll still moves
      const dur = Math.min(1100, Math.max(280, span / v));
      const startT = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - startT) / dur);
        const e = smoothstep(p);
        el.style.clipPath = `inset(0 0 0 ${((1 - e) * 100).toFixed(2)}%)`;
        if (p < 1) animRaf = requestAnimationFrame(step);
      };
      step();
    };

    const check = () => {
      if (triggered) return;
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight * (0.6 - delay)) {
        triggered = true;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        finish();
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const t = performance.now();
      vel = Math.abs(y - lastY) / Math.max(1, t - lastT);
      lastY = y;
      lastT = t;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };

    check(); // in case it's already in view on load
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(animRaf);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ clipPath: "inset(0 0 0 100%)" }}
    >
      {children}
    </div>
  );
}
