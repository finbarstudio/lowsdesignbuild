"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The footer's 1px hairline, drawn left→right the first time it scrolls into
 * view (scaleX 0→1 from the left edge). Uses a scroll-position check so it
 * fires reliably however fast you arrive at the footer.
 */
export default function FooterRule() {
  const ref = useRef<HTMLDivElement>(null);
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
      if (r.top < window.innerHeight * 0.92) {
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

  return (
    <div
      ref={ref}
      className="h-px w-full origin-left bg-tertiary transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ transform: `scaleX(${shown ? 1 : 0})` }}
    />
  );
}
