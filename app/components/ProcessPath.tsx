"use client";

import { useEffect, useRef, useState } from "react";

import { processSteps } from "@/app/lib/site";

type Pt = { x: number; y: number };

/**
 * Our process as a scroll-linked pathway. The four stages sit in a responsive
 * grid (single column on mobile, 2×2 on desktop landscape) and a winding line
 * connects them. As you scroll, an active dot travels the line, draws a red
 * trail and lights up each stage as it arrives.
 */
export default function ProcessPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoPathRef = useRef<SVGPolylineElement>(null);
  const nodeLen = useRef<number[]>([]);

  const STEPS = processSteps.length;

  const [d, setD] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pts, setPts] = useState<Pt[]>([]);
  const [active, setActive] = useState(-1);

  // Build the path through the measured centre of each stage's node.
  useEffect(() => {
    const build = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const wr = wrap.getBoundingClientRect();
      const p: Pt[] = nodeRefs.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
      });
      // final point: the top-centre of the logomark, so the line runs into it
      const lr = logoRef.current;
      if (lr) {
        const r = lr.getBoundingClientRect();
        p.push({ x: r.left - wr.left + r.width / 2, y: r.top - wr.top + 4 });
      }
      let dd = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
      for (let i = 1; i < p.length; i++) {
        const my = (p[i - 1].y + p[i].y) / 2;
        dd += ` C ${p[i - 1].x.toFixed(1)} ${my.toFixed(1)}, ${p[i].x.toFixed(1)} ${my.toFixed(1)}, ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)}`;
      }
      setD(dd);
      setPts(p);
      setSize({ w: wr.width, h: wr.height });
    };
    build();
    window.addEventListener("resize", build);
    const t = setTimeout(build, 300); // after fonts settle
    return () => {
      window.removeEventListener("resize", build);
      clearTimeout(t);
    };
  }, []);

  // Measure each node's distance along the path, wire the trail + scroll.
  useEffect(() => {
    const base = baseRef.current;
    const trail = trailRef.current;
    if (!base || !d || pts.length === 0) return;

    const total = base.getTotalLength();
    // sample the path to find where (along its length) each node sits
    const N = 260;
    const samples: { x: number; y: number; l: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const l = (i / N) * total;
      const pt = base.getPointAtLength(l);
      samples.push({ x: pt.x, y: pt.y, l });
    }
    nodeLen.current = pts.map((p) => {
      let best = 0;
      let bd = Infinity;
      for (const s of samples) {
        const dx = s.x - p.x;
        const dy = s.y - p.y;
        const dist = dx * dx + dy * dy;
        if (dist < bd) {
          bd = dist;
          best = s.l;
        }
      }
      return best;
    });

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
      const L = progress * total;
      const pt = base.getPointAtLength(L);
      if (dotRef.current) {
        dotRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      }
      if (trail) trail.style.strokeDashoffset = `${total - L}`;
      let a = -1;
      for (let i = 0; i < STEPS; i++) {
        if (L >= nodeLen.current[i] - 2) a = i;
      }
      setActive((prev) => (prev === a ? prev : a));
      // once the trail passes the last step, draw the logomark into completion
      const logoStart = nodeLen.current[STEPS - 1] ?? total;
      const logoP = Math.min(
        1,
        Math.max(0, (L - logoStart) / Math.max(1, total - logoStart)),
      );
      if (logoPathRef.current) {
        logoPathRef.current.style.strokeDashoffset = `${1 - logoP}`;
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
  }, [d, pts]);

  return (
    <div ref={wrapRef} className="relative">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
        fill="none"
        aria-hidden="true"
      >
        {d && (
          <>
            <path ref={baseRef} d={d} stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
            <path ref={trailRef} d={d} stroke="var(--tertiary)" strokeWidth="2" strokeLinecap="round" />
            {pts.slice(0, STEPS).map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
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

      {/* The connecting line zigzags within a narrow central band (nodes sit at
          38% / 62% of the width). The text is pushed to the outer edge on the
          matching side, so the line lives in the middle and never runs through
          the copy. On mobile it collapses to a left rail with the text beside it. */}
      <div className="flex flex-col">
        {processSteps.map((step, i) => {
          const right = i % 2 === 1;
          return (
            <div
              key={step.n}
              className="relative flex min-h-[24vh] items-center sm:min-h-[34vh]"
            >
              {/* node — on the left rail (mobile) or the central band (sm+) */}
              <span
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className={`absolute top-1/2 z-10 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 left-[8%] ${
                  right ? "sm:left-[62%]" : "sm:left-[38%]"
                }`}
              />
              {/* copy — beside the rail on mobile, outboard of the band on sm+ */}
              <div
                className={`ml-[18%] w-[74%] text-left sm:ml-0 sm:w-[34%] ${
                  right
                    ? "sm:ml-auto sm:pl-8 sm:text-left"
                    : "sm:pr-8 sm:text-right"
                }`}
              >
                <span
                  className={`font-mono text-sm font-medium tracking-[0.1em] transition-colors duration-500 ${
                    active >= i ? "text-tertiary" : "text-muted"
                  }`}
                >
                  {step.n}
                </span>
                <h3
                  className={`mt-2 text-xl font-semibold tracking-tight transition-opacity duration-500 sm:text-2xl ${
                    active >= i ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed text-muted transition-opacity duration-500 ${
                    active >= i ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {step.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* the line runs on past the last stage and draws the logomark to finish */}
      <div className="mt-12 flex justify-center sm:mt-16">
        <div ref={logoRef} className="w-20 sm:w-24">
          <svg
            viewBox="0 0 121.43 86.64"
            fill="none"
            className="w-full"
            aria-hidden="true"
          >
            <polyline
              ref={logoPathRef}
              points="2 84.64 2 56.06 27.52 38.21 27.52 3.23 96.77 37.67 96.77 3.59 49.38 3.59 49.38 84.64 71.25 84.64 71.25 55.88 119.43 55.88 119.43 84.64"
              stroke="var(--tertiary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
