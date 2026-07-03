"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { processSteps as fallbackSteps } from "@/app/lib/site";

type Step = { n: string; title: string; text: string };
type Pt = { x: number; y: number };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Our process — a centred WINDING timeline (~80vw). The four stages stack down
 * the page, their nodes alternating around the centre line (1 & 3 to the left,
 * 2 & 4 to the right) with the copy pushed to the outer edge. A single line
 * winds through the nodes as a smooth S-curve; a gold trail fills it and a dot
 * rides the leading edge as you scroll, revealing each stage ONE AT A TIME as it
 * arrives. The View projects button sits at the foot and its gold outline traces
 * on once the dot lands (the end-of-sequence choreography is still to come).
 *
 * The path is built from the measured node centres (rebuilt on resize / once the
 * font settles), so it always fits the rendered layout.
 */
export default function ProcessPath({
  steps = fallbackSteps,
  title = "Our process",
  centerButton,
  onLanded,
}: {
  steps?: Step[];
  title?: string;
  centerButton?: ReactNode;
  onLanded?: (landed: boolean) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const btnStageRef = useRef<HTMLDivElement>(null);
  const nodeLen = useRef<number[]>([]);

  const [d, setD] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pts, setPts] = useState<Pt[]>([]);
  const [active, setActive] = useState(-1);

  // Build the winding S-path through the measured node centres.
  useEffect(() => {
    const build = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const sr = stage.getBoundingClientRect();
      const p: Pt[] = nodeRefs.current.filter(Boolean).map((el) => {
        const r = el!.getBoundingClientRect();
        return {
          x: r.left - sr.left + r.width / 2,
          y: r.top - sr.top + r.height / 2,
        };
      });
      if (p.length < 2) return;
      // Cubic beziers with control points at the mid-height between nodes, so the
      // line leaves each node vertically and eases across — a smooth S, not a Z.
      let dd = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
      for (let i = 1; i < p.length; i++) {
        const my = (p[i - 1].y + p[i].y) / 2;
        dd += ` C ${p[i - 1].x.toFixed(1)} ${my.toFixed(1)}, ${p[i].x.toFixed(1)} ${my.toFixed(1)}, ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)}`;
      }
      setD(dd);
      setPts(p);
      setSize({ w: sr.width, h: sr.height });
    };
    build();
    window.addEventListener("resize", build);
    const t = setTimeout(build, 300); // rebuild once the web font settles
    return () => {
      window.removeEventListener("resize", build);
      clearTimeout(t);
    };
  }, [steps]);

  // Measure where each node sits along the path, then drive scroll.
  useEffect(() => {
    const base = baseRef.current;
    if (!base || !d || pts.length === 0) return;

    const total = base.getTotalLength();
    // sample the path to find the length at which each node sits
    const N = 300;
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
        const dd = (s.x - p.x) ** 2 + (s.y - p.y) ** 2;
        if (dd < bd) {
          bd = dd;
          best = s.l;
        }
      }
      return best;
    });

    if (trailRef.current) {
      trailRef.current.style.strokeDasharray = `${total}`;
      trailRef.current.style.strokeDashoffset = `${total}`;
    }

    let raf = 0;
    let curActive = -1;
    let curLanded = false;

    const update = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const vh = window.innerHeight;
      const r = wrap.getBoundingClientRect();
      const progress = clamp((vh * 0.5 - r.top) / r.height, 0, 1);
      const L = progress * total;

      if (dotRef.current) {
        const pt = base.getPointAtLength(L);
        dotRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        dotRef.current.style.opacity = (
          clamp(progress / 0.04, 0, 1) * clamp((1 - progress) / 0.03, 0, 1)
        ).toFixed(3);
      }
      if (trailRef.current)
        trailRef.current.style.strokeDashoffset = `${total - L}`;

      // Which stage the dot has reached → light it (one at a time).
      let a = -1;
      for (let i = 0; i < nodeLen.current.length; i++)
        if (L >= nodeLen.current[i] - 1) a = i;
      if (a !== curActive) {
        curActive = a;
        setActive(a);
      }

      // Fade the sticky title out as the timeline ends.
      if (titleRef.current)
        titleRef.current.style.opacity = clamp(
          1 - (progress - 0.82) / 0.12,
          0,
          1,
        ).toFixed(3);

      // Button pin-stage: it sits centred and pinned in its own tall stage after
      // the line. As you scroll through: it grows in, holds (larger), then fades
      // out as the Instagram section scrolls up over it.
      if (btnRef.current && btnStageRef.current) {
        const br = btnStageRef.current.getBoundingClientRect();
        // 0 as the stage enters, 1 by the time it has scrolled a screen past.
        const bp = clamp((vh * 0.5 - br.top) / (br.height - vh), 0, 1);
        const fadeIn = clamp(bp / 0.14, 0, 1);
        const fadeOut = clamp((0.9 - bp) / 0.14, 0, 1);
        btnRef.current.style.opacity = Math.min(fadeIn, fadeOut).toFixed(3);
        const g = clamp((bp - 0.05) / 0.6, 0, 1);
        btnRef.current.style.transform = `scale(${(0.82 + g * 0.45).toFixed(3)})`;
      }

      const landed = progress > 0.985;
      if (landed !== curLanded) {
        curLanded = landed;
        onLanded?.(landed);
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
  }, [d, pts, onLanded]);

  return (
    <>
    <div ref={wrapRef} className="relative mx-auto w-[86vw] max-w-[880px]">
      {/* Sticky title, faded out by the rAF as the timeline ends. */}
      <h2
        ref={titleRef}
        className="label sticky top-24 z-30 text-center !text-ink"
      >
        {title}
      </h2>
      <div aria-hidden className="h-[8vh] sm:h-[10vh]" />

      <div ref={stageRef} className="relative">
        {/* the winding line + nodes + travelling dot */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          fill="none"
          aria-hidden="true"
        >
          {d && (
            <>
              <path d={d} stroke="rgba(66,73,82,0.18)" strokeWidth="1.5" strokeLinecap="round" />
              <path
                ref={baseRef}
                d={d}
                stroke="transparent"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                ref={trailRef}
                d={d}
                stroke="var(--tertiary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={active >= i ? 5 : 3.5}
                  fill={active >= i ? "var(--tertiary)" : "var(--background)"}
                  stroke={active >= i ? "var(--tertiary)" : "rgba(66,73,82,0.3)"}
                  strokeWidth="1.5"
                  style={{ transition: "r 0.3s ease, fill 0.3s ease" }}
                />
              ))}
              <g ref={dotRef} style={{ opacity: 0 }}>
                <circle r="4.5" fill="var(--tertiary)" />
              </g>
            </>
          )}
        </svg>

        {/* stages stacked; nodes wind around the centre (1,3 left · 2,4 right),
            copy to the outer edge. Each lights ONE AT A TIME as the dot arrives. */}
        <div className="flex flex-col">
          {steps.map((step, i) => {
            const right = i % 2 === 1;
            return (
              <div
                key={step.n}
                className="relative flex min-h-[34vh] items-center sm:min-h-[40vh]"
              >
                {/* node — on a left rail (mobile) or the winding band (sm+) */}
                <span
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  aria-hidden
                  className={`absolute top-1/2 z-10 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 left-[6%] ${
                    right ? "sm:left-[66%]" : "sm:left-[34%]"
                  }`}
                />
                {/* copy — beside the rail (mobile) or outboard of the band (sm+),
                    dimmed until the dot reaches this stage. */}
                <div
                  className={`ml-[16%] w-[78%] text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:ml-0 sm:w-[32%] ${
                    right
                      ? "sm:ml-auto sm:pl-10 sm:text-left"
                      : "sm:pr-10 sm:text-right"
                  } ${active >= i ? "opacity-100" : "translate-y-2 opacity-30"}`}
                >
                  <span
                    className={`font-mono text-sm font-semibold tracking-[0.14em] transition-colors duration-300 ${
                      active >= i ? "text-tertiary" : "text-muted"
                    }`}
                  >
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>

      {/* Button end-stage: pinned centre of its own tall stage. The button grows
          in and holds, with lots of room below, then fades as the Instagram
          section scrolls up over it. (The winding→2×2 morph is a next step.) */}
      {centerButton && (
        <div ref={btnStageRef} className="relative h-[130vh] sm:h-[170vh]">
          <div className="sticky top-0 flex h-[100svh] items-center justify-center">
            <div
              ref={btnRef}
              className="vp-trace-scope origin-center will-change-transform"
              style={{ opacity: 0 }}
            >
              {centerButton}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
