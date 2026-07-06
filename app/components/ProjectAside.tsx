"use client";

import { useEffect, useRef, useState } from "react";

export type Swatch = { hex: string; name: string };

/**
 * The header row above a project's intro copy: the tags inline on the LEFT
 * (aligned to the copy's left edge) and the palette as small colour SQUARES on
 * the RIGHT — the same height as the tag pills, so the row reads as one line.
 * Everything mask-reveals from the left when scrolled into view.
 */
export default function ProjectAside({
  tags,
  colours,
}: {
  tags: string[];
  colours: Swatch[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

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
  const swatches = colours.slice(0, 5);

  return (
    <div
      ref={rootRef}
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
    >
      {/* tags — inline, wrapping; each masks in from the left */}
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

      {/* colour squares — pill-height, right-aligned; each wipes in from the
          left on a stagger after the tags */}
      {swatches.length > 0 && (
        <div className="ml-auto flex gap-2">
          {swatches.map((c, i) => (
            <span
              key={`${c.hex}-${i}`}
              title={c.name || c.hex}
              className="block h-[28px] w-[28px]"
              style={{
                background: c.hex,
                clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                transition: `clip-path 0.6s ${ease}`,
                transitionDelay: `${tags.length * 90 + 150 + i * 90}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
