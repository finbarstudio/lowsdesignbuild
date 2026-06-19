"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The areas we cover, as big outlined pills that reveal one by one (staggered
 * fade + rise) the first time the section scrolls into view.
 */
export default function AreaPills({ areas }: { areas: string[] }) {
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
      className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 sm:gap-4"
    >
      {areas.map((area, i) => (
        <span
          key={area}
          className="inline-flex items-center rounded-full border border-ink/45 px-5 py-2 text-lg font-medium uppercase leading-none tracking-[0.04em] sm:px-7 sm:py-2.5 sm:text-2xl"
          style={{
            transform: shown ? "translateY(0)" : "translateY(10px)",
            opacity: shown ? 1 : 0,
            transition:
              "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease",
            transitionDelay: `${i * 70}ms`,
          }}
        >
          {area}
        </span>
      ))}
    </div>
  );
}
