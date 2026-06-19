"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals its children by dropping them into place from above (translateY from
 * -14px → 0, with a fade) the first time they scroll into view. `delay` staggers
 * it after a sibling — e.g. the names drop in after their photo has wiped in.
 */
export default function DropReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** transition-delay in milliseconds */
  delay?: number;
}) {
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
      // fire once the block has risen past the middle of the screen, i.e. after
      // its photo (which finishes a little higher) has revealed
      if (r.top < window.innerHeight * 0.55) {
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
      className={className}
      style={{
        transform: shown ? "translateY(0)" : "translateY(-14px)",
        opacity: shown ? 1 : 0,
        transition:
          "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
