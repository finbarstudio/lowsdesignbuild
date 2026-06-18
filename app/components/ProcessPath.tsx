"use client";

import { useEffect, useRef, useState } from "react";

import { processSteps } from "@/app/lib/site";

const LANE = 56; // px width of the path lane on the left
const NODE_X = 28; // centre of the lane

/**
 * Our process, as a scroll-linked pathway: a winding line connects the four
 * stages and an active dot travels down it as you scroll, drawing a red trail
 * and lighting up each stage as it arrives.
 */
export default function ProcessPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const basePathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);

  const [d, setD] = useState("");
  const [height, setHeight] = useState(0);
  const [nodes, setNodes] = useState<number[]>([]);
  const [active, setActive] = useState(-1);

  // Build the winding path through the measured centres of each step.
  useEffect(() => {
    const build = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      const ys = stepRefs.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY - top + r.height / 2;
      });
      let dd = `M ${NODE_X} ${ys[0].toFixed(1)}`;
      for (let i = 1; i < ys.length; i++) {
        const y0 = ys[i - 1];
        const y1 = ys[i];
        const bow = i % 2 === 1 ? LANE - 8 : 8; // alternate the wave side
        const c1y = y0 + (y1 - y0) * 0.25;
        const c2y = y0 + (y1 - y0) * 0.75;
        dd += ` C ${bow} ${c1y.toFixed(1)}, ${bow} ${c2y.toFixed(1)}, ${NODE_X} ${y1.toFixed(1)}`;
      }
      setD(dd);
      setNodes(ys);
      setHeight(wrap.offsetHeight);
    };

    build();
    window.addEventListener("resize", build);
    const t = setTimeout(build, 300); // after fonts settle
    return () => {
      window.removeEventListener("resize", build);
      clearTimeout(t);
    };
  }, []);

  // Scroll → move the dot, draw the trail, light up stages.
  useEffect(() => {
    const base = basePathRef.current;
    const trail = trailRef.current;
    if (!base || !d) return;

    const total = base.getTotalLength();
    if (trail) {
      trail.style.strokeDasharray = `${total}`;
      trail.style.strokeDashoffset = `${total}`;
    }

    let raf = 0;
    const update = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (vh * 0.5 - rect.top) / rect.height),
      );
      const pt = base.getPointAtLength(progress * total);
      if (dotRef.current) {
        dotRef.current.setAttribute(
          "transform",
          `translate(${pt.x} ${pt.y})`,
        );
      }
      if (trail) trail.style.strokeDashoffset = `${total * (1 - progress)}`;

      // active = last node the dot has reached
      let a = -1;
      for (let i = 0; i < nodes.length; i++) {
        if (pt.y >= nodes[i] - 6) a = i;
      }
      setActive((prev) => (prev === a ? prev : a));
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
  }, [d, nodes]);

  return (
    <div ref={wrapRef} className="relative">
      {/* the path */}
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={LANE}
        height={height || 1}
        viewBox={`0 0 ${LANE} ${height || 1}`}
        fill="none"
        aria-hidden="true"
      >
        {d && (
          <>
            <path
              ref={basePathRef}
              d={d}
              stroke="var(--line)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              ref={trailRef}
              d={d}
              stroke="var(--tertiary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {nodes.map((y, i) => (
              <circle
                key={i}
                cx={NODE_X}
                cy={y}
                r={active >= i ? 5 : 3.5}
                fill={active >= i ? "var(--tertiary)" : "var(--background)"}
                stroke={active >= i ? "var(--tertiary)" : "var(--line)"}
                strokeWidth="2"
                style={{ transition: "r 0.3s ease, fill 0.3s ease" }}
              />
            ))}
            <g ref={dotRef}>
              <circle r="9" fill="var(--tertiary)" opacity="0.18" />
              <circle r="4.5" fill="var(--tertiary)" />
            </g>
          </>
        )}
      </svg>

      {/* the stages */}
      <div style={{ paddingLeft: LANE + 28 }}>
        {processSteps.map((step, i) => (
          <div
            key={step.n}
            data-step
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="flex min-h-[34vh] flex-col justify-center"
          >
            <span
              className={`font-mono text-sm font-medium tracking-[0.1em] transition-colors duration-500 ${
                active >= i ? "text-tertiary" : "text-muted"
              }`}
            >
              {step.n}
            </span>
            <h3
              className={`mt-3 text-xl font-semibold tracking-tight transition-opacity duration-500 sm:text-2xl ${
                active >= i ? "opacity-100" : "opacity-40"
              }`}
            >
              {step.title}
            </h3>
            <p
              className={`mt-3 max-w-md text-sm leading-relaxed text-muted transition-opacity duration-500 ${
                active >= i ? "opacity-100" : "opacity-40"
              }`}
            >
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
