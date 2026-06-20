"use client";

import { useEffect, useState } from "react";

const BAR = 64;

/**
 * On a project detail page (desktop), once you scroll off the hero the project
 * title masks up into a small sticky label just below the LOWS logo in the nav,
 * and takes the same scroll-driven colour as the logo (white over the hero,
 * ink over content, tertiary at the footer).
 */
export default function ProjectTitleDock({ title }: { title: string }) {
  const [past, setPast] = useState(false);
  const [mode, setMode] = useState<"hero" | "ink" | "footer">("hero");

  useEffect(() => {
    const f = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      setPast(y > vh * 0.55);
      const footer = document.getElementById("site-footer");
      const atFooter = footer ? y + BAR >= footer.offsetTop : false;
      const dark = y >= vh - BAR;
      setMode(atFooter ? "footer" : dark ? "ink" : "hero");
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => {
      window.removeEventListener("scroll", f);
      window.removeEventListener("resize", f);
    };
  }, []);

  const color =
    mode === "footer"
      ? "text-tertiary"
      : mode === "hero"
        ? "text-white"
        : "text-ink";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed left-4 top-[3.05rem] z-50 hidden max-w-[40vw] overflow-hidden transition-colors duration-300 sm:left-6 sm:block ${color}`}
    >
      <span
        className="block font-sans text-sm font-semibold uppercase leading-none tracking-tight"
        style={{
          transform: past ? "translateY(0)" : "translateY(120%)",
          transition: "transform 0.6s cubic-bezier(0.76,0,0.24,1)",
        }}
      >
        {title}
      </span>
    </div>
  );
}
