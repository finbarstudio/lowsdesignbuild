"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small cluster of colour chips overlaid on a gallery image (top-left). Each
 * chip masks in bottom-to-top, staggered, when the image scrolls into view.
 */
export default function ColourSwatches({ colours }: { colours: string[] }) {
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
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        setShown(true);
        cleanup();
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cleanup();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 sm:left-4 sm:top-4"
    >
      {colours.map((hex, i) => (
        <span
          key={`${hex}-${i}`}
          className="block h-2.5 w-9 sm:h-3 sm:w-12"
          style={{
            background: hex,
            clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            transition: "clip-path 0.6s cubic-bezier(0.76,0,0.24,1)",
            transitionDelay: `${i * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}
