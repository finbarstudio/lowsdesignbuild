"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Masked line reveal: the children slide up into place from behind their own
 * top edge — the wrapper clips them so they're cropped until fully risen (the
 * .mask-reveal token). `delay` staggers it after a sibling, e.g. the names rise
 * in just after their photo has wiped in.
 */
export default function DropReveal({
  children,
  className = "",
  wrapClassName = "",
  delay = 0,
}: {
  children: React.ReactNode;
  /** classes for the moving element (layout, e.g. the names grid) */
  className?: string;
  /** classes for the clip wrapper (spacing, e.g. mt-4) */
  wrapClassName?: string;
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
      className={`mask-reveal ${wrapClassName} ${shown ? "is-revealed" : ""}`}
    >
      <div className={className} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    </div>
  );
}
