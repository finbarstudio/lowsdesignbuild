"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useProcessLanded } from "@/app/components/ProcessFlow";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Client wrapper around the ViewProjectsButton markup. Two jobs:
 *
 *  1. GOLD LATCH — reads the shared "landed" signal (set by ProcessPath when the
 *     travelling dot reaches the foot of the timeline) and adds `vp-flow--landed`,
 *     which fires the one-shot hit-and-go dot (pure CSS ::before) and turns the
 *     pill gold. Outside a ProcessFlow provider (about / contact) landed is always
 *     false, so this stays inert.
 *
 *  2. GROW — once landed, writes `--vp-grow` per scroll frame from the pin stage's
 *     progress, so the pinned button grows as you scroll through the pin beat. The
 *     grow tracks the pin stage (not the pill centre, which freezes once pinned).
 *     Only runs on the home page, where the button sits inside `.vp-pin-stage`.
 *
 * Reduced motion: no scroll listener, no grow — the static gold latch still reads.
 */
export default function VpFlowHighlight({ children }: { children: ReactNode }) {
  const landed = useProcessLanded();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Reduced motion, or no pin stage (about/contact): park the scale at 1 and
    // don't install any scroll work. The gold class still applies statically.
    const stage = el.closest<HTMLElement>(".vp-pin-stage");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !stage || !landed) {
      el.style.setProperty("--vp-grow", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sr = stage.getBoundingClientRect();
      // 0 when the stage top reaches the 40vh pin line (the button just pins) →
      // 1 by the time the stage has scrolled its own height past it (pin releases).
      // So the grow ramps across exactly the pinned beat.
      const p = clamp((vh * 0.4 - sr.top) / Math.max(1, sr.height), 0, 1);
      el.style.setProperty("--vp-grow", (1 + p * 0.16).toFixed(4));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [landed]);

  return (
    <div ref={wrapRef} className={landed ? "vp-flow vp-flow--landed" : "vp-flow"}>
      {children}
    </div>
  );
}
