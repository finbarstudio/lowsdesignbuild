"use client";

import { useEffect, useState } from "react";

/**
 * A small, subtle scroll indicator — MOBILE only, pinned to the bottom-right
 * corner over every page's hero: a tiny "scroll" label above a short hairline
 * with a dot that drifts down it. Fades away as soon as the visitor scrolls.
 * `mix-blend-difference` keeps it legible over both photo heroes (reads light)
 * and paper heroes (reads dark). Rendered once in the site layout.
 */
export default function ScrollHint() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      if (window.scrollY > 40) setGone(true);
      else setGone(false);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-6 right-5 z-30 flex flex-col items-center gap-2 mix-blend-difference transition-opacity duration-700 sm:hidden ${
        gone ? "opacity-0" : "opacity-70"
      }`}
    >
      <style>{`
        @keyframes scroll-hint-drop {
          0% { transform: translateY(-8px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(26px); opacity: 0; }
        }
        .scroll-hint-dot { animation: scroll-hint-drop 1.7s cubic-bezier(.45,0,.55,1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .scroll-hint-dot { animation: none; transform: translateY(10px); opacity: 1; }
        }
      `}</style>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white">
        scroll
      </span>
      <span className="relative block h-7 w-px overflow-hidden bg-white/30">
        <span className="scroll-hint-dot absolute left-0 top-0 h-2 w-px bg-white" />
      </span>
    </div>
  );
}
