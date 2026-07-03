"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useProcessLanded } from "@/app/components/ProcessFlow";

type Trace = { w: number; h: number; right: string; left: string };

/**
 * Client wrapper around the ViewProjectsButton markup. In the "Our process"
 * flow (inside `.vp-trace-scope`) it measures the pill and builds two SVG
 * half-paths (top-centre → each side → bottom-centre); the pill itself has no
 * visible border, and when the travelling dot lands the two paths draw the gold
 * outline on — tracing from the top middle down both sides to the bottom middle.
 *
 * Outside that scope (about / contact / projects pages) there's no trace and no
 * landed signal, so the button renders as a plain ink pill, untouched.
 */
export default function VpFlowHighlight({ children }: { children: ReactNode }) {
  const landed = useProcessLanded();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [trace, setTrace] = useState<Trace | null>(null);

  // Measure the pill and build the outline-trace paths (process flow only).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !el.closest(".vp-trace-scope")) return;

    const measure = () => {
      const pill = el.querySelector<HTMLElement>(".vp");
      if (!pill) return;
      const w = pill.offsetWidth;
      const h = pill.offsetHeight;
      if (!w || !h) return;
      const r = h / 2; // pill = fully rounded ends
      const right = `M ${w / 2} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${w / 2}`;
      const left = `M ${w / 2} 0 H ${r} A ${r} ${r} 0 0 0 0 ${r} V ${h - r} A ${r} ${r} 0 0 0 ${r} ${h} H ${w / 2}`;
      setTrace({ w, h, right, left });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
