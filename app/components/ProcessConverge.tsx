"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { LandedContext } from "@/app/components/ProcessFlow";
import { processSteps as fallbackSteps } from "@/app/lib/site";

type Step = { n: string; title: string; text: string };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The process END SEQUENCE. After the winding timeline completes, this stage
 * scrolls in: the four process items come DOWN together (staggered) and combine
 * into a compact 2×2 grid — no line — pinned to the viewport. Continued scroll
 * nudges the grid up a little while the View projects button grows in beneath it
 * (its gold outline tracing on). The button then STAYS; the Instagram section
 * (opaque, later in the DOM, higher z) scrolls up OVER the pinned stage — the
 * same overlap pattern as the process section covering the hero slogan.
 *
 * IMPORTANT: this must be a DIRECT child of the home page's big `relative z-10`
 * wrapper (a sibling of the process + Instagram sections). That makes the big
 * wrapper the sticky containing block, so the stage stays pinned while Instagram
 * slides over it, instead of un-pinning when its own section ends.
 *
 * Scroll drivers (all rAF, no per-frame React):
 *   enter q — 0 → 1 as the stage rises into view (drives the converge-down).
 *   hold  p — 0 → 1 across the spacer below (drives grid nudge + button grow).
 */
export default function ProcessConverge({
  steps = fallbackSteps,
  button,
}: {
  steps?: Step[];
  button: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const spacer = spacerRef.current;
    if (!stage || !spacer) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let curLanded = false;

    const update = () => {
      const vh = window.innerHeight;
      const sr = stage.getBoundingClientRect();
      // ENTER: 0 when the stage top is at the viewport bottom → 1 once pinned.
      const q = clamp(1 - sr.top / vh, 0, 1);
      // HOLD: 0 at the pin → 1 once the spacer has scrolled through (just as
      // the Instagram section reaches the viewport bottom and starts covering).
      const sp = spacer.getBoundingClientRect();
      const p = clamp((vh - sp.top) / Math.max(1, sp.height), 0, 1);

      // The four items converge DOWN into the 2×2, slightly staggered.
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        if (reduce) {
          el.style.transform = "none";
          el.style.opacity = "1";
          return;
        }
        const d0 = i * 0.07; // stagger
        const t = smooth(clamp((q - d0) / Math.max(0.01, 0.88 - d0), 0, 1));
        el.style.transform = `translateY(${((1 - t) * -(20 + i * 7)).toFixed(2)}vh)`;
        el.style.opacity = t.toFixed(3);
      });

      // Continued scroll: the grid nudges up a touch, the button grows in and
      // HOLDS — no fade-out; Instagram simply covers the stage.
      const g = smooth(p);
      if (gridRef.current)
        gridRef.current.style.transform = reduce
          ? "none"
          : `translateY(${(-g * 6).toFixed(2)}vh)`;
      if (btnRef.current) {
        btnRef.current.style.opacity = reduce
          ? "1"
          : clamp((q - 0.75) / 0.2, 0, 1).toFixed(3);
        btnRef.current.style.transform = reduce
          ? "none"
          : `translateY(${(-g * 3).toFixed(2)}vh) scale(${(0.92 + g * 0.4).toFixed(3)})`;
      }

      // Assembled → fire the button's gold outline trace.
      const isLanded = q >= 0.96;
      if (isLanded !== curLanded) {
        curLanded = isLanded;
        setLanded(isLanded);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Pinned stage — z-0 so the Instagram section (z-10, opaque) paints over
          it as it scrolls up. Stays pinned for the rest of the wrapper. */}
      <div
        ref={stageRef}
        className="sticky top-0 z-0 flex h-[100svh] flex-col items-center justify-center"
      >
        <div
          ref={gridRef}
          className="mx-auto grid w-[86vw] max-w-3xl grid-cols-2 gap-x-10 gap-y-10 will-change-transform sm:gap-x-16 sm:gap-y-14"
        >
          {steps.map((s, i) => (
            <div
              key={s.n}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              style={{ opacity: 0 }}
              className="will-change-transform"
            >
              <span className="font-mono text-sm font-semibold tracking-[0.14em] text-tertiary">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
                {s.title}
              </h3>
              <p className="mt-2 hidden max-w-xs text-sm leading-relaxed text-muted sm:block">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        {/* the button grows in beneath the grid and stays until covered */}
        <div
          ref={btnRef}
          style={{ opacity: 0 }}
          className="vp-trace-scope mt-12 origin-center will-change-transform sm:mt-16"
        >
          <LandedContext.Provider value={landed}>
            {button}
          </LandedContext.Provider>
        </div>
      </div>

      {/* Hold room: the scroll distance the assembled stage stays pinned and
          uncovered (grid nudge + button grow play across it). Instagram starts
          covering the moment this has scrolled through. */}
      <div ref={spacerRef} aria-hidden className="h-[85vh] sm:h-[95vh]" />
    </>
  );
}
