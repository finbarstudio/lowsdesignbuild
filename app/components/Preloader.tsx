"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Keyhole preloader — the site's entrance.
 *
 * The LOWS mark draws itself on a paper curtain, then the WHOLE mark becomes a
 * see-through cut (same line weight as the drawn stroke, so it's seamless) and
 * zooms into the rightmost perfectly-vertical bar — a central vertical slit that
 * widens across the screen and reveals the page beneath, like going in through a
 * keyhole. Coordinated with HomeChrome's entrance so the page is already settled
 * behind the curtain before the slit opens.
 *
 * The curtain is decided during render (not a post-mount setState), so it's in
 * the server-rendered HTML and covers the page from the FIRST paint — no flash of
 * the page before it drops. It plays once per real document load of the home page
 * (module flag survives client-side navigation, resets on reload). Skipped for
 * `prefers-reduced-motion`, and fail-open: a stalled timeline can't leave the page
 * covered (a CSS fail-safe clears the curtain; a timeout unmounts it).
 */

// The LOWS house mark (viewBox 121.43 × 86.64) as a single open polyline.
const POLY =
  "2 84.64 2 56.06 27.52 38.21 27.52 3.23 96.77 37.67 96.77 3.59 49.38 3.59 49.38 84.64 71.25 84.64 71.25 55.88 119.43 55.88 119.43 84.64";

// mark bbox centre, and the rightmost vertical bar's centre (the zoom anchor)
const CX = 60.715,
  CY = 43.935,
  NAT_W = 121.43,
  SW = 4,
  BAR_CX = 119.43,
  BAR_CY = (55.88 + 84.64) / 2;

// timeline (ms): draw → hold → the slit opens. Kept tight (~2.35s total) so the
// preloader + the staggered chrome entrance that follows it finish under 4s.
const DRAW = 1050,
  HOLD = 200,
  REVEAL = 1050;
const holdEnd = DRAW + HOLD;
const endAll = holdEnd + REVEAL + 40;

// Whether the entrance has been claimed this document load. Module scope → resets
// on a real reload, but survives client-side navigation (the layout persists).
let started = false;

export default function Preloader() {
  const pathname = usePathname();

  // Decide ONCE, on the first render (server + client), whether to play. Reading
  // the module flag in a lazy initialiser — rather than flipping state in an
  // effect — keeps SSR and hydration in sync and puts the curtain in the initial
  // HTML, so it covers from the first paint. It also can't flip mid-animation.
  const [play] = useState(() => pathname === "/" && !started);

  const [hidden, setHidden] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!play || hidden) return;
    started = true; // claim this load (idempotent if the effect double-fires)
    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      setHidden(true);
      // Tell HomeChrome the curtain has lifted so it can fire the staggered
      // chrome entrance right as the hero is revealed. The global flag closes
      // the race where the preloader finishes before HomeChrome's listener
      // attaches (HomeChrome reads it on mount). Both are idempotent.
      const w = window as unknown as { __lowsPreloaderLifted?: boolean };
      if (w.__lowsPreloaderLifted) return;
      w.__lowsPreloaderLifted = true;
      window.dispatchEvent(new Event("preloader:done"));
    };

    // Reduced motion: no animation — drop the curtain next tick (CSS already
    // hides it, so there's no flash) and reveal the page.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(finish, 0);
      return () => window.clearTimeout(id);
    }

    const q = <T extends Element>(s: string) => root.querySelector(s) as T | null;
    const drawG = q<SVGGElement>(".preloader__drawg");
    const drawPath = q<SVGPolylineElement>(".preloader__draw");
    const aperture = q<SVGPolylineElement>(".preloader__aperture");
    if (!drawG || !drawPath || !aperture) return;

    const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let W = 0,
      H = 0,
      baseScale = 1,
      endScale = 400,
      drawnBarX = 0,
      drawnBarY = 0;

    // Shared draw/reveal transform. At rp=0 it equals a logo-centred transform,
    // so draw → reveal is continuous. As rp→1 the whole mark scales up
    // (exponential zoom = natural dolly) while the anchor bar pans to centre.
    const xf = (rp: number) => {
      const e = easeInOutCubic(rp);
      const s = baseScale * Math.pow(endScale / baseScale, e);
      const px = lerp(drawnBarX, W / 2, e);
      const py = lerp(drawnBarY, H / 2, e);
      return `translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${s.toFixed(4)}) translate(${-BAR_CX} ${-BAR_CY})`;
    };

    const layout = () => {
      const r = root.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      const desiredPx = clamp(96, Math.min(W, H) * 0.17, 175);
      baseScale = desiredPx / NAT_W;
      endScale = (1.4 * Math.max(W, H)) / SW; // just past full stage coverage
      drawnBarX = W / 2 + (BAR_CX - CX) * baseScale;
      drawnBarY = H / 2 + (BAR_CY - CY) * baseScale;
      drawG.setAttribute(
        "transform",
        `translate(${W / 2} ${H / 2}) scale(${baseScale}) translate(${-CX} ${-CY})`,
      );
    };

    const render = (t: number) => {
      const rp = clamp((t - holdEnd) / REVEAL, 0, 1);
      const T = xf(rp);
      drawPath.setAttribute(
        "stroke-dashoffset",
        (1 - easeInOutCubic(clamp(t / DRAW, 0, 1))).toFixed(4),
      );
      drawG.setAttribute("transform", T);
      drawG.setAttribute("opacity", (1 - clamp(rp / 0.4, 0, 1)).toFixed(3));
      aperture.setAttribute("transform", t < holdEnd ? "scale(0)" : T);
    };

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = now - t0;
      render(t);
      if (t >= endAll) {
        finish(); // unmount → page fully revealed + interactive
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(layout);
    ro.observe(root);
    layout();
    render(0); // paint the settled curtain before the first rAF tick
    raf = requestAnimationFrame(frame);
    // belt-and-braces: if rAF is throttled/stalled (e.g. backgrounded tab), still
    // tear the curtain down.
    const failsafe = window.setTimeout(finish, endAll + 900);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [play, hidden]);

  if (!play || hidden) return null;

  return (
    // Critical covering styles are inline (not from the stylesheet) so the curtain
    // covers from the very first paint — even before globals.css applies in dev —
    // with no flash of the page underneath. Colours are hard-coded to the brand
    // paper/slate for the same reason (CSS vars would depend on the stylesheet).
    <div
      className="preloader"
      ref={rootRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 80 }}
    >
      <svg
        className="preloader__svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          {/* white rect = curtain shows; the mark (black) is the see-through cut */}
          <mask id="preloader-keyhole">
            <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
            <polyline
              className="preloader__aperture"
              points={POLY}
              fill="none"
              stroke="#000"
              strokeWidth={SW}
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              transform="scale(0)"
            />
          </mask>
        </defs>
        <rect
          className="preloader__paper"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#f4f1ea"
          mask="url(#preloader-keyhole)"
        />
        <g className="preloader__drawg" fill="none">
          <polyline
            className="preloader__draw"
            points={POLY}
            pathLength={1}
            stroke="#424952"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </g>
      </svg>
    </div>
  );
}
