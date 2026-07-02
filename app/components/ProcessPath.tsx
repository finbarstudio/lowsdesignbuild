"use client";

import { useEffect, useRef, useState } from "react";

import { processSteps as fallbackSteps } from "@/app/lib/site";

type Step = { n: string; title: string; text: string };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * Our process — a centred vertical timeline. A hairline runs down the middle and
 * fills gold with scroll; each step sits centred on the line. Steps fade in from
 * the bottom and fade out again near the top, so they separate cleanly from the
 * sticky "Our process" title above. Opacity + the line fill are driven straight
 * on the DOM (no per-frame React renders); only the active index is state.
 */
export default function ProcessPath({
  steps = fallbackSteps,
}: {
  steps?: Step[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    let cur = -1;
    const update = () => {
      const vh = window.innerHeight;
      const r = wrap.getBoundingClientRect();
      if (fillRef.current) {
        const f = clamp((vh * 0.5 - r.top) / r.height, 0, 1);
        fillRef.current.style.height = `${(f * 100).toFixed(2)}%`;
      }
      let a = -1;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const er = el.getBoundingClientRect();
        const c = er.top + er.height / 2; // step centre, viewport coords
        // fade out near the top (below the sticky title), fade in from the bottom
        const topFade = clamp((c - vh * 0.15) / (vh * 0.2), 0, 1);
        const botFade = clamp((vh * 1.02 - c) / (vh * 0.28), 0, 1);
        el.style.opacity = Math.min(topFade, botFade).toFixed(3);
        if (c <= vh * 0.5) a = i;
      });
      if (a !== cur) {
        cur = a;
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
  }, []);

  return (
    <div ref={wrapRef} className="relative mx-auto max-w-xl">
      {/* central line + gold scroll fill */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--line)]"
        aria-hidden="true"
      />
      <div
        ref={fillRef}
        className="pointer-events-none absolute left-1/2 top-0 w-px -translate-x-1/2 bg-tertiary"
        style={{ height: "0%" }}
        aria-hidden="true"
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
