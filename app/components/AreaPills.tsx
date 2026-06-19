"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The areas we cover, as big outlined pills that reveal one by one (staggered
 * fade + rise) the first time the section scrolls into view.
 */
export default function AreaPills({
  areas,
  align = "center",
  widthClass = "max-w-5xl",
  animate = true,
}: {
  areas: string[];
  align?: "center" | "left";
  widthClass?: string;
  animate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let raf = 0;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.7 && r.bottom > 0) {
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
      className={`flex ${widthClass} flex-wrap gap-3 sm:gap-4 ${
        align === "left" ? "justify-start" : "mx-auto justify-center"
      }`}
    >
      {areas.map((area, i) => (
        // each pill rises up out of its own clip mask, one after another
        <span key={area} className="inline-block overflow-hidden align-bottom">
          <span
            className="inline-flex items-center rounded-full border-2 border-current px-4 py-2 text-sm font-bold uppercase leading-none tracking-[0.04em] sm:px-5 sm:py-2.5 sm:text-lg"
            style={{
              transform: shown ? "translateY(0)" : "translateY(110%)",
              transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: `${i * 150}ms`,
            }}
          >
            <span className="block translate-y-[0.06em]">{area}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
