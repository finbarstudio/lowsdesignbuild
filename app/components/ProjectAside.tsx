"use client";

import { useEffect, useRef, useState } from "react";

export type Swatch = { hex: string; name: string };

// Relative luminance → pick black/white text for contrast.
function isDark(hex: string): boolean {
  const m = hex.replace("#", "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.55;
}

/**
 * The left rail of a project's intro: the tags (inline, wrapping) and a stack of
 * colour tiles, all of which mask-reveal from the left when scrolled into view.
 * The colour stack fills the column height (which matches the body copy), and
 * shows fewer tiles when there's less room.
 */
export default function ProjectAside({
  tags,
  colours,
}: {
  tags: string[];
  colours: Swatch[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(Math.min(5, colours.length));
  const [shown, setShown] = useState(false);

  // how many tiles fit (≥56px each), capped at 5 and the number of colours
  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      const max = Math.min(5, colours.length);
      const min = Math.min(3, colours.length); // always show at least 3
      const fit = Math.max(min, Math.min(max, Math.floor(h / 56)));
      setCount(fit);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [colours.length]);

  // reveal when scrolled into view (scroll + getBoundingClientRect, no observer)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let raf = 0;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
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

  const ease = "cubic-bezier(0.76,0,0.24,1)";
  const items = colours.slice(0, count);

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-6">
      {/* tags — inline, wrapping; each masks in from the left */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span key={t} className="inline-flex overflow-hidden">
              <span
                className="pill text-ink"
                style={{
                  transform: shown ? "translateX(0)" : "translateX(-110%)",
                  transition: `transform 0.6s ${ease}`,
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                {t}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* colour tiles — fill the remaining height; each wipes in from the left
          revealing its name in mono type */}
      <div
        ref={stackRef}
        className="flex min-h-[15rem] flex-1 flex-col gap-2 lg:min-h-0"
      >
        {items.map((c, i) => {
          const delay = tags.length * 90 + 150 + i * 110;
          return (
            <div key={`${c.hex}-${i}`} className="relative flex-1 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: c.hex,
                  clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                  transition: `clip-path 0.7s ${ease}`,
                  transitionDelay: `${delay}ms`,
                }}
              />
              {c.name && (
                <span
                  className="absolute inset-0 flex items-center px-4 font-mono text-[0.7rem] uppercase tracking-[0.12em]"
                  style={{
                    color: isDark(c.hex) ? "#ffffff" : "#1a1a1a",
                    opacity: shown ? 1 : 0,
                    transition: "opacity 0.5s ease",
                    transitionDelay: `${delay + 280}ms`,
                  }}
                >
                  {c.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
