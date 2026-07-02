"use client";

import { useEffect, useRef, useState } from "react";

import { processSteps as fallbackSteps } from "@/app/lib/site";

type Step = { n: string; title: string; text: string };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Our process — a centred vertical timeline drawn as a single SVG so the line,
 * its gold trail and the travelling dot are ONE object (not three stacked divs).
 *
 * The line is a faint hairline that fades out near the top (a gradient mask, so
 * it dissolves under the sticky "Our process" title rather than butting into
 * it). A gold "trail" is the same line revealed from the top down via
 * stroke-dashoffset as you scroll, and a gold dot rides its leading edge — the
 * dot is literally the end of the fill, so line + dot read as one moving thing.
 *
 * Everything scroll-driven is written straight to the DOM inside a rAF (no React
 * re-renders per frame). Only two low-frequency signals go to React/parent:
 *   • active step index (state here → lights that step gold), and
 *   • onLanded(true) once the dot reaches the bottom, so the parent can flow the
 *     accent into the "View projects" button.
 * Steps fade in from the bottom and out near the top so they separate from the
 * title, and each sits on a paper block so the line only shows in the gaps.
 */

// SVG canvas geometry. The line lives on a fixed viewBox and stretches to the
// wrapper's real height via preserveAspectRatio="none", so one path length
// (LINE_LEN) drives the dash maths no matter how tall the column renders.
const VB_W = 40;
const VB_H = 1000;
const CX = VB_W / 2;
const Y0 = 0;
const Y1 = VB_H;
const LINE_LEN = Y1 - Y0;

export default function ProcessPath({
  steps = fallbackSteps,
  onLanded,
}: {
  steps?: Step[];
  onLanded?: (landed: boolean) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let raf = 0;
    let curActive = -1;
    let curLanded = false;

    const update = () => {
      const vh = window.innerHeight;
      const r = wrap.getBoundingClientRect();

      // Scroll progress 0..1: where viewport centre sits along the column.
      const progress = clamp((vh * 0.5 - r.top) / r.height, 0, 1);

      // Reveal the gold trail from the top down (full dash hidden at 0 → none at
      // 1) — the trail lives in the (non-uniformly stretched) SVG.
      if (trailRef.current) {
        trailRef.current.style.strokeDashoffset = (
          LINE_LEN *
          (1 - progress)
        ).toFixed(2);
      }
      // The dot is an HTML element (NOT an SVG circle) positioned by percentage,
      // so it stays perfectly round — the SVG uses preserveAspectRatio="none"
      // which would squash any in-SVG circle into a tall streak. It rides the
      // leading edge of the trail. Hidden until it clears the fading top; fades
      // as it parks into the button at the bottom (the button carries on the
      // accent). translateY(-50%) keeps its centre exactly on the fill's tip.
      if (dotRef.current) {
        const dotAlpha =
          clamp(progress / 0.06, 0, 1) * clamp((1 - progress) / 0.04, 0, 1);
        dotRef.current.style.top = `${(progress * 100).toFixed(2)}%`;
        dotRef.current.style.opacity = dotAlpha.toFixed(3);
      }

      // Landed once the fill has essentially reached the bottom.
      const landed = progress > 0.985;
      if (landed !== curLanded) {
        curLanded = landed;
        onLanded?.(landed);
      }

      // Per-step opacity + which step is "active" (last one above centre).
      let a = -1;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const er = el.getBoundingClientRect();
        const c = er.top + er.height / 2; // step centre, viewport coords
        const topFade = clamp((c - vh * 0.15) / (vh * 0.2), 0, 1);
        const botFade = clamp((vh * 1.02 - c) / (vh * 0.28), 0, 1);
        el.style.opacity = Math.min(topFade, botFade).toFixed(3);
        if (c <= vh * 0.5) a = i;
      });
      if (a !== curActive) {
        curActive = a;
        setActive(a);
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
    // onLanded is memoised by the parent (useCallback); listed for lint.
  }, [onLanded]);

  return (
    <div ref={wrapRef} className="relative mx-auto max-w-xl">
      {/* Lead space so the line begins well below the sticky title, and its top
          dissolves into that space (see the mask gradient below). */}
      <div aria-hidden className="h-[22vh] sm:h-[26vh]" />

      {/* The line as ONE SVG: faint hairline (top-faded via mask) + gold trail
          revealed top-down + the travelling dot on the trail's leading edge.
          Spans the full wrapper height and stretches to fit. */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Top-fade: transparent at the very top → solid by ~14% down. Used as
              a mask so BOTH the hairline and the gold dissolve near the title. */}
          <linearGradient id="pp-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.14" stopColor="#000" stopOpacity="1" />
            <stop offset="1" stopColor="#000" stopOpacity="1" />
          </linearGradient>
          <mask id="pp-mask">
            <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#pp-fade)" />
          </mask>
        </defs>

        <g mask="url(#pp-mask)">
          {/* faint hairline — the whole track, ahead of the dot */}
          <line
            x1={CX}
            y1={Y0}
            x2={CX}
            y2={Y1}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* gold trail — same line, revealed from the top down via dashoffset */}
          <line
            ref={trailRef}
            x1={CX}
            y1={Y0}
            x2={CX}
            y2={Y1}
            stroke="var(--tertiary)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{
              strokeDasharray: LINE_LEN,
              strokeDashoffset: LINE_LEN,
              transition: "stroke-dashoffset 0.08s linear",
            }}
          />
        </g>
      </svg>

      {/* travelling dot — the leading edge of the gold fill, as an HTML element
          so it stays perfectly round (an in-SVG circle would be squashed by
          preserveAspectRatio="none"). A soft glow ring reads as light flowing
          down the line. Position is driven per-frame via `top` (see the rAF). */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary opacity-0"
        style={{
          // gold halo — same gold as --tertiary (#a97e1f), matching the button's
          // rgba(169,126,31,…) shadows so the accent is consistent.
          boxShadow:
            "0 0 0 4px rgba(169, 126, 31, 0.18), 0 0 10px 2px rgba(169, 126, 31, 0.45)",
        }}
      />

      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div
            key={step.n}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="relative flex min-h-[38vh] flex-col items-center justify-center text-center"
          >
            {/* node on the line */}
            <span
              className={`relative z-10 mb-6 block h-3 w-3 rounded-full border-2 transition-colors duration-500 ${
                active >= i
                  ? "border-tertiary bg-tertiary"
                  : "border-[var(--line)] bg-background"
              }`}
            />
            {/* copy sits on a paper block so the line reads only in the gaps */}
            <div className="relative z-10 max-w-sm bg-background px-4">
              <span
                className={`font-mono text-sm font-semibold tracking-[0.14em] transition-colors duration-500 ${
                  active >= i ? "text-tertiary" : "text-muted"
                }`}
              >
                {step.n}
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {step.title}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
