"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { LandedContext } from "@/app/components/ProcessFlow";
import { processSteps as fallbackSteps } from "@/app/lib/site";

type Step = { n: string; title: string; text: string };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The process END SEQUENCE. As this pinned stage scrolls in after the winding
 * timeline, the ACTUAL four step elements from the timeline (tagged
 * [data-pp-copy] in ProcessPath — no duplicates) are PULLED down, FLIP-style,
 * onto invisible anchor slots arranged as a compact 2×2 grid in the stage. The
 * anchors mirror the timeline copies' exact width/markup (same 86vw/880px
 * container, same 32% columns at the same left/right edges), so the pull is a
 * pure vertical glide with zero reflow. The View projects button grows in
 * beneath, then EVERYTHING fades to transparent just before the Instagram
 * section arrives — no opaque wipe edge.
 *
 * On mobile the FLIP is skipped (the stacked timeline copies are far wider than
 * 2×2 cells): the originals scroll off naturally and the anchors themselves
 * fade in as a compact stack.
 *
 * Must be a DIRECT child of the home page's big `relative z-10` wrapper (a
 * sibling of the process + Instagram sections) so the stage stays pinned while
 * Instagram scrolls past above it.
 */
export default function ProcessConverge({
  steps = fallbackSteps,
  button,
}: {
  steps?: Step[];
  button: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);
  // the translate currently applied to each timeline copy (so we can recover
  // its natural, untransformed position without a reset-and-reflow each frame)
  const applied = useRef<{ x: number; y: number }[]>([]);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const spacer = spacerRef.current;
    if (!stage || !spacer) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobileMq = window.matchMedia("(max-width: 639px)");
    const copies = Array.from(
      document.querySelectorAll<HTMLElement>("[data-pp-copy]"),
    );
    applied.current = copies.map(() => ({ x: 0, y: 0 }));

    let raf = 0;
    let curLanded = false;

    const update = () => {
      const vh = window.innerHeight;
      const mobile = mobileMq.matches;
      const sr = stage.getBoundingClientRect();
      // ENTER: 0 with the stage a viewport away → 1 once pinned at the top.
      const q = clamp(1 - sr.top / vh, 0, 1);

      // MOBILE: no converge stack, no pin, no grow, no fade — the button is a
      // plain in-flow element between the process line and Instagram. Just fire
      // the gold trace once it's well into view, and make sure it's visible.
      if (mobile) {
        if (btnRef.current) {
          btnRef.current.style.opacity = "1";
          btnRef.current.style.transform = "none";
        }
        copies.forEach((c, i) => {
          if (c.style.transform) {
            c.style.transform = "";
            c.style.opacity = "";
            c.style.transition = "";
            applied.current[i] = { x: 0, y: 0 };
          }
        });
        const isL = q >= 0.5;
        if (isL !== curLanded) {
          curLanded = isL;
          setLanded(isL);
        }
        return;
      }
      // HOLD: 0 at the pin → 1 once the spacer has scrolled through.
      const sp = spacer.getBoundingClientRect();
      const p = clamp((vh - sp.top) / Math.max(1, sp.height), 0, 1);
      // FADE: everything goes transparent just BEFORE Instagram enters the
      // viewport (its top reaching ~1.02vh) — no hard wipe edge.
      const ig = document.querySelector("[data-ig-section]");
      const fade = ig
        ? clamp(
            (ig.getBoundingClientRect().top - vh * 1.02) / (vh * 0.3),
            0,
            1,
          )
        : 1;

      // Grid nudges up a touch across the hold; the anchors (and therefore the
      // pulled originals, which track them) ride along.
      const g = smooth(p);
      if (gridRef.current)
        gridRef.current.style.transform = reduce
          ? "none"
          : `translateY(${(-g * 5).toFixed(2)}vh)`;

      // ---- The pull (desktop only) ------------------------------------------
      copies.forEach((c, i) => {
        const slot = anchorRefs.current[i];
        if (!slot) return;

        if (reduce) {
          // no FLIP: release the originals entirely
          if (c.style.transform) {
            c.style.transform = "";
            c.style.opacity = "";
            c.style.transition = "";
            applied.current[i] = { x: 0, y: 0 };
          }
          return;
        }

        const t = smooth(
          clamp((q - i * 0.04) / Math.max(0.01, 0.92 - i * 0.04), 0, 1),
        );
        if (t <= 0) {
          // back on the timeline: hand control back to its own classes
          if (c.style.transform) {
            c.style.transform = "";
            c.style.opacity = "";
            c.style.transition = "";
            applied.current[i] = { x: 0, y: 0 };
          }
          return;
        }
        const r = c.getBoundingClientRect();
        const natX = r.left - applied.current[i].x;
        const natY = r.top - applied.current[i].y;
        const s = slot.getBoundingClientRect();
        const dx = (s.left - natX) * t;
        const dy = (s.top - natY) * t;
        applied.current[i] = { x: dx, y: dy };
        c.style.transition = "none"; // we drive it per-frame — no easing lag
        c.style.willChange = "transform";
        c.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        c.style.opacity = fade < 1 ? fade.toFixed(3) : "";
      });

      // Button: grows in as the stage assembles and STAYS (no fade). Once
      // Instagram starts entering, the button rides up locked to the page
      // scroll (translating exactly with the incoming section), so it scrolls
      // away naturally instead of sitting pinned underneath the grid.
      if (btnRef.current) {
        let dy = 0;
        if (ig) {
          const igTop = ig.getBoundingClientRect().top;
          if (igTop < vh) dy = igTop - vh;
        }
        btnRef.current.style.opacity = reduce
          ? "1"
          : clamp((q - 0.7) / 0.22, 0, 1).toFixed(3);
        btnRef.current.style.transform = reduce
          ? "none"
          : `translateY(${dy.toFixed(1)}px) scale(${(0.92 + g * 0.35).toFixed(3)})`;
      }

      const isLanded = q >= 0.96;
      if (isLanded !== curLanded) {
        curLanded = isLanded;
        setLanded(isLanded);
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
      // hand the timeline copies back untouched
      copies.forEach((c) => {
        c.style.transform = "";
        c.style.opacity = "";
        c.style.transition = "";
        c.style.willChange = "";
      });
    };
  }, [steps]);

  return (
    <>
      {/* Desktop: pinned, transparent stage whose content fades out before
          Instagram (z-10, later in the DOM) scrolls past above it.
          Mobile: a plain in-flow block — just the button, no pin/converge. */}
      <div
        ref={stageRef}
        // mobile pb matches the visual gap ABOVE the button (last process step →
        // button ≈ row leftover + paddings), so the button sits evenly between
        // the final step and the Instagram grid
        className="relative flex flex-col items-center pb-[94px] pt-10 sm:sticky sm:top-0 sm:z-0 sm:h-[100svh] sm:justify-center sm:py-0"
      >
        {/* Anchor slots: the SAME 86vw/880px container as the timeline, two
            32%-wide columns at the same left/right edges — so the pulled
            originals glide straight down onto them with zero reflow. Invisible
            on desktop (the originals are the visible items); on mobile these
            fade in themselves as a compact stack. */}
        <div
          ref={gridRef}
          className="mx-auto hidden w-[86vw] max-w-[880px] will-change-transform sm:block"
        >
          <div className="flex flex-col gap-y-8 sm:gap-y-16">
            {[0, 1].map((row) => (
              <div
                key={row}
                className="flex flex-col gap-y-8 sm:flex-row sm:justify-between"
              >
                {steps.slice(row * 2, row * 2 + 2).map((s, col) => {
                  const i = row * 2 + col;
                  const right = col === 1;
                  return (
                    <div
                      key={s.n}
                      ref={(el) => {
                        anchorRefs.current[i] = el;
                      }}
                      style={{ opacity: 0 }}
                      className={`w-full text-left will-change-transform sm:w-[32%] ${
                        right
                          ? "sm:pl-10 sm:text-left"
                          : "sm:pr-10 sm:text-right"
                      }`}
                    >
                      <span className="font-mono text-sm font-semibold tracking-[0.14em] text-tertiary">
                        {s.n}
                      </span>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                        {s.title}
                      </h3>
                      <p className="mt-2 hidden text-sm leading-relaxed text-muted sm:block">
                        {s.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* the button grows in beneath the grid, holds, then fades with it
            (desktop) — on mobile it's simply here, full opacity, in flow */}
        <div
          ref={btnRef}
          style={{ opacity: 0 }}
          className="vp-trace-scope origin-center will-change-transform sm:mt-16"
        >
          <LandedContext.Provider value={landed}>
            {button}
          </LandedContext.Provider>
        </div>
      </div>

      {/* Hold room (desktop only): how long the assembled stage stays before the
          fade-out and Instagram's arrival. Kept short — the button shouldn't
          outstay. On mobile there's no pin, so no hold room either. */}
      <div ref={spacerRef} aria-hidden className="hidden h-[60vh] sm:block" />
    </>
  );
}
