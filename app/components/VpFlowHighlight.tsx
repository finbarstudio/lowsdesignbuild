"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useProcessLanded } from "@/app/components/ProcessFlow";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

type Trace = { w: number; h: number; right: string; left: string };

/**
 * Client wrapper around the ViewProjectsButton markup. Three jobs, all HOME-only
 * (they need the pin stage + the ProcessFlow landed signal; on about / contact
 * there is neither, so the button renders as a plain ink pill, untouched):
 *
 *  1. TRACE — measures the pill and builds two SVG half-paths (top-centre → each
 *     side → bottom-centre). The pill itself has no visible border; when the dot
 *     lands the two paths draw the gold outline on, tracing from the top middle
 *     down both sides to the bottom middle.
 *  2. GOLD LATCH — adds `vp-flow--landed` when the travelling dot reaches the foot
 *     of the timeline (turns the label gold + fires the trace).
 *  3. GROW — writes `--vp-grow` per scroll frame from the pin stage's progress, so
 *     the pinned button grows as you scroll through the pin beat.
 *
 * Reduced motion: no scroll listener, no grow; the trace still draws statically.
 */
export default function VpFlowHighlight({ children }: { children: ReactNode }) {
  const landed = useProcessLanded();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [trace, setTrace] = useState<Trace | null>(null);

  // Measure the pill and build the outline-trace paths (home only). Re-measures
  // on resize since the pill width tracks its label / breakpoint.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !el.closest(".vp-pin-stage")) return; // not the home flow button

    const measure = () => {
      const pill = el.querySelector<HTMLElement>(".vp");
      if (!pill) return;
      const w = pill.offsetWidth;
      const h = pill.offsetHeight;
      if (!w || !h) return;
      const r = h / 2; // pill = fully rounded ends
      // Both halves start at top-centre and end at bottom-centre, so they draw
      // symmetrically outward from the top and meet again at the bottom.
      const right = `M ${w / 2} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${w / 2}`;
      const left = `M ${w / 2} 0 H ${r} A ${r} ${r} 0 0 0 0 ${r} V ${h - r} A ${r} ${r} 0 0 0 ${r} ${h} H ${w / 2}`;
      setTrace({ w, h, right, left });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Grow: ramp the scale across the pinned beat (pin-stage progress), once landed.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

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
      // 0 when the stage top reaches the 40vh pin line → 1 by the time the stage
      // has scrolled its own height past it — so the grow ramps across the pin.
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

  const cls = ["vp-flow"];
  if (trace) cls.push("vp-flow--trace");
  if (landed) cls.push("vp-flow--landed");

  return (
    <div ref={wrapRef} className={cls.join(" ")}>
      {trace && (
        <svg
          className="vp-trace"
          viewBox={`0 0 ${trace.w} ${trace.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="vp-trace__p" d={trace.right} pathLength={1} />
          <path className="vp-trace__p" d={trace.left} pathLength={1} />
        </svg>
      )}
      {children}
    </div>
  );
}
