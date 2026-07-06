"use client";

import { useEffect, useState } from "react";

/**
 * The hero's supporting copy (intro line / contact details). Holds hidden while
 * the big WordReveal slogan plays, then fades up once it has finished — the
 * page passes a delay computed from the slogan's word count. Reduced motion
 * shows it immediately.
 */
export default function HeroIntro({
  delay,
  className = "",
  children,
}: {
  /** ms after mount before the fade-in starts */
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const t = window.setTimeout(() => setShown(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition:
          "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </div>
  );
}
