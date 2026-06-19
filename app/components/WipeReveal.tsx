"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-linked wipe reveal. The clip-path (top→bottom) is driven directly by
 * the element's position in the viewport, so the image uncovers in lock-step
 * with the scroll — no opacity, no scale. As the element travels up from the
 * bottom of the viewport it reveals proportionally, fully open by the time it
 * reaches the upper-middle of the screen.
 */
export default function WipeReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
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
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // begin revealing as the top enters near the bottom of the viewport,
      // finish once it has risen to the upper-middle of the screen
      const start = vh * 0.95;
      const end = vh * 0.4;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      el.style.clipPath = `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`;
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
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      {children}
    </div>
  );
}
