"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { processSteps as fallbackSteps } from "@/app/lib/site";

type Step = { n: string; title: string; text: string };
type Pt = { x: number; y: number };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Our process — a centred ZIGZAG timeline (~80vw). The four stages sit in a 2×2
 * layout: steps 1 & 3 down the LEFT, 2 & 4 down the RIGHT, their copy pushed to
 * the outer edges and their nodes toward the centre. A single line zigzags
 * through the four nodes (1→2 across the top, 2→3 diagonally through the middle,
 * 3→4 across the bottom); a gold trail fills it and a dot rides the leading edge
 * as you scroll, lighting each stage as it arrives.
 *
 * The centre is left open: the "View projects" button (passed in as centerButton)
 * scrolls up and grows to fill it right where the 2→3 diagonal crosses, so the
 * line reads as flowing into the button. The button's gold outline then traces on
 * once the dot lands (onLanded → shared context → the button).
 *
 * Path geometry is measured from the real node centres (rebuilt on resize/fonts),
 * so it always fits the rendered layout.
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
  const nodeLen = useRef<number[]>([]);
  const totalLen = useRef(0);

  const [d, setD] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pts, setPts] = useState<Pt[]>([]);
  const [active, setActive] = useState(-1);

  // Build the zigzag path + node lengths from the measured node centres.
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
      let dd = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
      const lens = [0];
      for (let i = 1; i < p.length; i++) {
        dd += ` L ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)}`;
        lens[i] = lens[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      }
      nodeLen.current = lens;
      totalLen.current = lens[lens.length - 1];
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

  // Scroll: dot travel, trail reveal, node colouring, title fade, button reveal.
  useEffect(() => {
    const base = baseRef.current;
    if (!base || !d) return;
    const total = totalLen.current || base.getTotalLength();
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

      // Node colouring synced to the dot (each node is a path vertex).
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
          1 - (progress - 0.72) / 0.14,
          0,
          1,
        ).toFixed(3);

      // Centre button: scrolls up + grows to FILL the centre as we near the end.
      // Centring is handled by the stable outer wrapper; this inner element only
      // carries the reveal (rise + scale), so scaling stays centred on itself.
      if (btnRef.current) {
        if (window.innerWidth >= 640) {
          const rev = clamp((progress - 0.62) / 0.3, 0, 1);
          const e = rev * rev * (3 - 2 * rev); // smoothstep
          btnRef.current.style.opacity = e.toFixed(3);
          btnRef.current.style.transform = `translateY(${(
            (1 - e) * 34
          ).toFixed(1)}px) scale(${(0.8 + 0.2 * e).toFixed(3)})`;
        } else {
          btnRef.current.style.opacity = "1";
          btnRef.current.style.transform = "none";
        }
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
  }, [d, onLanded]);

  return (
    <div ref={wrapRef} className="relative mx-auto w-[86vw] max-w-[1100px]">
      {/* Sticky title, faded out by the rAF as the timeline ends. */}
      <h2
        ref={titleRef}
        className="label sticky top-24 z-30 text-center !text-ink"
      >
        {title}
      </h2>
      <div aria-hidden className="h-[8vh] sm:h-[10vh]" />

      <div ref={stageRef} className="relative">
        {/* the zigzag line + nodes + travelling dot, one SVG sized to the stage */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {d && (
            <>
              <path
                ref={baseRef}
                d={d}
                stroke="rgba(66,73,82,0.20)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                ref={trailRef}
                d={d}
                stroke="var(--tertiary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke-dashoffset 0.08s linear" }}
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

        {/* two rows; each row: a LEFT step (node inner-right) and a RIGHT step
            (node inner-left), copy pushed to the outer edge. 1,3 left · 2,4 right. */}
        <div className="relative flex flex-col gap-y-10 sm:gap-y-0">
          {[0, 1].map((row) => (
            <div
              key={row}
              className="flex flex-col gap-y-10 sm:min-h-[42vh] sm:flex-row sm:items-center sm:justify-between sm:gap-y-0"
            >
              {[0, 1].map((col) => {
                const i = row * 2 + col;
                const step = steps[i];
                if (!step) return null;
                const isLeft = col === 0;
                return (
                  <div
                    key={step.n}
                    className={`flex items-center gap-4 sm:w-[34%] ${
                      isLeft
                        ? "sm:flex-row-reverse sm:text-left"
                        : "sm:text-right"
                    }`}
                  >
                    <span
                      ref={(el) => {
                        nodeRefs.current[i] = el;
                      }}
                      aria-hidden
                      className="block h-3 w-3 shrink-0"
                    />
                    <div>
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
                      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* the button fills the centre (desktop) / sits below (mobile). The outer
            wrapper does the centring (stable); the inner carries the scroll
            reveal (rise + scale), so the scale stays centred. */}
        {centerButton && (
          <div className="vp-trace-scope mt-6 flex justify-center sm:absolute sm:left-1/2 sm:top-1/2 sm:z-20 sm:mt-0 sm:block sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div ref={btnRef} style={{ opacity: 0 }} className="origin-center">
              {centerButton}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
