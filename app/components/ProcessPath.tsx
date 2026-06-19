"use client";

import { useEffect, useRef, useState } from "react";

import { processSteps } from "@/app/lib/site";

type Pt = { x: number; y: number };

// The LOWS logomark as a single polyline, in its own coordinate box. The path
// runs into its first point and then traces these, so the mark is drawn as a
// continuation of the same stroke.
const LOGO_W = 121.43;
const LOGO_H = 86.64;
const LOGO_POINTS: [number, number][] = (() => {
  const n =
    "2 84.64 2 56.06 27.52 38.21 27.52 3.23 96.77 37.67 96.77 3.59 49.38 3.59 49.38 84.64 71.25 84.64 71.25 55.88 119.43 55.88 119.43 84.64"
      .split(/\s+/)
      .map(Number);
  const a: [number, number][] = [];
  for (let i = 0; i < n.length; i += 2) a.push([n[i], n[i + 1]]);
  return a;
})();

/**
 * Our process as a scroll-linked pathway. The four stages sit in a centred
 * zigzag and a winding line connects them; as you scroll, a dot travels the
 * line, draws the trail and lights up each stage. After the last stage the line
 * runs on into the LOWS logomark and draws it to finish — one continuous stroke.
 */
export default function ProcessPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const logoBaseRef = useRef<SVGPathElement>(null);
  const logoTrailRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const nodeLen = useRef<number[]>([]);

  const STEPS = processSteps.length;

  const [d, setD] = useState("");
  const [dLogo, setDLogo] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pts, setPts] = useState<Pt[]>([]);
  const [active, setActive] = useState(-1);

  // Build the connecting path (through the stage nodes, then down into the
  // logomark's start point) plus the logomark path, all in wrap coordinates.
  useEffect(() => {
    const build = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const wr = wrap.getBoundingClientRect();
      const p: Pt[] = nodeRefs.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return {
          x: r.left - wr.left + r.width / 2,
          y: r.top - wr.top + r.height / 2,
        };
      });

      let logoPath = "";
      let divert = "";
      const lr = logoRef.current;
      if (lr) {
        const r = lr.getBoundingClientRect();
        const lx = r.left - wr.left;
        const ly = r.top - wr.top;
        const scale = r.width / LOGO_W;
        const startX = lx + LOGO_POINTS[0][0] * scale;
        const startY = ly + LOGO_POINTS[0][1] * scale;
        const rightEdge = lx + LOGO_W * scale;
        const lastN = p[p.length - 1];
        // one smooth cubic that bows out past the right edge and below the mark,
        // then curves up into the bottom-left start point — a continuous loop,
        // never crossing the logo or its left edge (no kink/sharp corner).
        const c1x = rightEdge + 60;
        const c1y = lastN.y + (startY - lastN.y) * 0.5;
        const c2x = startX + 50;
        const c2y = startY + 110;
        divert = ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${startX.toFixed(1)} ${startY.toFixed(1)}`;
        logoPath = LOGO_POINTS.map(
          (pt, i) =>
            `${i === 0 ? "M" : "L"} ${(lx + pt[0] * scale).toFixed(1)} ${(
              ly +
              pt[1] * scale
            ).toFixed(1)}`,
        ).join(" ");
      }

      let dd = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
      for (let i = 1; i < p.length; i++) {
        const my = (p[i - 1].y + p[i].y) / 2;
        dd += ` C ${p[i - 1].x.toFixed(1)} ${my.toFixed(1)}, ${p[i].x.toFixed(1)} ${my.toFixed(1)}, ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)}`;
      }
      dd += divert;
      setD(dd);
      setDLogo(logoPath);
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

  // Measure lengths, wire the trail + dot to scroll. The dot travels the main
  // path and then continues onto the logomark, drawing both.
  useEffect(() => {
    const base = baseRef.current;
    const trail = trailRef.current;
    const logoBase = logoBaseRef.current;
    const logoTrail = logoTrailRef.current;
    if (!base || !d || pts.length === 0) return;

    const mainTotal = base.getTotalLength();
    const logoTotal = logoBase ? logoBase.getTotalLength() : 0;
    const combined = mainTotal + logoTotal;

    // sample the main path to find where each stage node sits along it
    const N = 260;
    const samples: { x: number; y: number; l: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const l = (i / N) * mainTotal;
      const pt = base.getPointAtLength(l);
      samples.push({ x: pt.x, y: pt.y, l });
    }
    nodeLen.current = pts.slice(0, STEPS).map((p) => {
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
      trail.style.strokeDasharray = `${mainTotal}`;
      trail.style.strokeDashoffset = `${mainTotal}`;
    }
    if (logoTrail) {
      logoTrail.style.strokeDasharray = `${logoTotal}`;
      logoTrail.style.strokeDashoffset = `${logoTotal}`;
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
      const L = progress * combined;

      let pt: DOMPoint;
      if (L <= mainTotal) {
        pt = base.getPointAtLength(L);
        if (trail) trail.style.strokeDashoffset = `${mainTotal - L}`;
        if (logoTrail) logoTrail.style.strokeDashoffset = `${logoTotal}`;
      } else {
        const ll = Math.min(logoTotal, L - mainTotal);
        pt = logoBase!.getPointAtLength(ll);
        if (trail) trail.style.strokeDashoffset = `0`;
        if (logoTrail) logoTrail.style.strokeDashoffset = `${logoTotal - ll}`;
      }
      if (dotRef.current) {
        dotRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      }

      let a = -1;
      for (let i = 0; i < STEPS; i++) {
        if (L >= nodeLen.current[i] - 2) a = i;
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
  }, [d, dLogo, pts, STEPS]);

  return (
    <div ref={wrapRef} className="relative">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
        fill="none"
        aria-hidden="true"
      >
        {d && (
          <>
            <path ref={baseRef} d={d} stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
            <path ref={trailRef} d={d} stroke="var(--tertiary)" strokeWidth="2" strokeLinecap="round" />
            {dLogo && (
              <>
                <path
                  ref={logoBaseRef}
                  d={dLogo}
                  stroke="var(--line)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  ref={logoTrailRef}
                  d={dLogo}
                  stroke="var(--tertiary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
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

      {/* stages — centred zigzag, copy pushed to the outer edge (see below) */}
      <div className="flex flex-col">
        {processSteps.map((step, i) => {
          const right = i % 2 === 1;
          return (
            <div
              key={step.n}
              className="relative flex min-h-[24vh] items-center sm:min-h-[34vh]"
            >
              <span
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className={`absolute top-1/2 z-10 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 left-[8%] ${
                  right ? "sm:left-[62%]" : "sm:left-[38%]"
                }`}
              />
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

      {/* logomark — an invisible spacer that reserves the mark's footprint and
          is measured in build(); the mark itself is drawn in the SVG above. The
          pb leaves room for the line to divert below before curving up into it,
          and adds breathing space before the next section. */}
      <div className="mt-20 flex justify-center pb-28 sm:mt-28 sm:pb-40">
        <div ref={logoRef} className="aspect-[121.43/86.64] w-20 sm:w-24" />
      </div>
    </div>
  );
}
