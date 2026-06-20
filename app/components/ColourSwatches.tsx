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
      className="pointer-events-none absolute left-3 top-3 z-10 flex gap-1.5 sm:left-4 sm:top-4"
    >
      {colours.map((hex, i) => (
        <span key={`${hex}-${i}`} className="block overflow-hidden">
          <span
            className="block h-4 w-4 sm:h-5 sm:w-5"
            style={{
              background: hex,
              transform: shown ? "translateY(0)" : "translateY(110%)",
              transition: "transform 0.55s cubic-bezier(0.76,0,0.24,1)",
              transitionDelay: `${i * 120}ms`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
