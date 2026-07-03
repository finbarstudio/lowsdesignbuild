"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import InstantQuoteButton from "@/app/components/InstantQuoteButton";

// The estimate + contact pages don't get the floating CTA (it would just point
// back at where you already are) — there it sits statically in the footer.
const NO_FLOAT = new Set(["/contact", "/estimate"]);

// Once the CTA has entered in this session, later mounts / client-side
// navigations should show it INSTANTLY — no fade, no 420ms hold. The staggered
// entrance is only for the very first paint; re-running it on every navigation
// is what made the button flash/disappear as you moved between pages.
let ctaSeen = false;

/**
 * The single "Get an instant quote" button. There is only ONE instance: it lives
 * in the footer's CTA slot, and on every page EXCEPT contact/estimate it floats
 * bottom-right while you scroll, then docks into its footer slot when you reach
 * the bottom — and from there scrolls away with the footer. No second copy.
 *
 * The dock is seamless because the floating inset (20/28px) and the footer's own
 * gutter (20/28px, matched to the nav edge) put the floating button and the
 * docked slot on the exact same right edge; we simply switch from `fixed` to
 * `absolute` the instant the slot rises to the floating line, so nothing jumps.
 *
 * On contact / estimate there is no floating behaviour — the button just sits in
 * the footer statically.
 */
export default function DockingCta() {
  const pathname = usePathname();
  const canFloat = !NO_FLOAT.has(pathname ?? "");

  const slotRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(true);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Entrance: scale + fade the floating button in. On home, hold until the
  // preloader lifts so it arrives with the rest of the chrome; elsewhere a beat.
  useEffect(() => {
    if (!canFloat) return;
    const reveal = () => {
      ctaSeen = true;
      setRevealed(true);
    };
    // Already shown once this session (or reduced motion) — appear instantly.
    if (
      ctaSeen ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      reveal();
      return;
    }
    const lifted = (window as unknown as { __lowsPreloaderLifted?: boolean })
      .__lowsPreloaderLifted;
    let a = 0;
    let b = 0;
    if (pathname === "/" && !lifted) {
      const onDone = () => {
        a = window.setTimeout(reveal, 300);
      };
      window.addEventListener("preloader:done", onDone, { once: true });
      b = window.setTimeout(reveal, 3200); // fail-open
      return () => {
        window.removeEventListener("preloader:done", onDone);
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
    a = window.setTimeout(reveal, 420);
    return () => window.clearTimeout(a);
  }, [canFloat, pathname]);

  useEffect(() => {
    if (!canFloat) return;
    const slot = slotRef.current;
    const btn = btnRef.current;
    if (!slot || !btn) return;

    const pill = () => btn.querySelector<HTMLElement>(".btn-spotlight");

    const measure = () => {
      const p = pill();
      if (!p) return;
      const r = p.getBoundingClientRect();
      // ceil so the reserved slot never shrinks the pill below its natural width
      // (a sub-pixel constraint used to wrap the label onto a second line).
      setSize({ w: Math.ceil(r.width), h: Math.ceil(r.height) });
    };

    let raf = 0;
    let cur = true;
    const update = () => {
      raf = 0;
      const p = pill();
      const h = p ? p.offsetHeight : 56;
      const inset = window.matchMedia("(min-width: 640px)").matches ? 28 : 20;
      // Viewport y where the floating button's TOP sits. Dock once the slot has
      // risen to (or above) that line — then floating-top === docked-top, so the
      // switch from fixed → absolute is seamless.
      const dockLine = window.innerHeight - inset - h;
      const slotTop = slot.getBoundingClientRect().top;
      const shouldFloat = slotTop > dockLine + 1; // 1px hysteresis
      if (shouldFloat !== cur) {
        cur = shouldFloat;
        setFloating(shouldFloat);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // Re-measure + recompute on the next frame too, so a client-side navigation
    // (new page height, scroll reset to top) re-floats the button instead of
    // leaving it stuck in the previous page's docked/absolute position — which
    // read as the CTA "disappearing" until you scrolled.
    measure();
    update();
    const kick = requestAnimationFrame(() => {
      measure();
      update();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [canFloat, pathname]);

  // Contact / estimate: a plain static button in the footer slot.
  if (!canFloat) return <InstantQuoteButton />;

  return (
    <div
      ref={slotRef}
      className="dock-cta"
      style={size ? { width: size.w, height: size.h } : undefined}
    >
      <div
        ref={btnRef}
        className={`dock-cta__btn ${floating ? "is-floating" : "is-docked"} ${
          revealed ? "is-revealed" : ""
        }`}
      >
        <InstantQuoteButton />
      </div>
      <style>{`
        .dock-cta { position: relative; }
        /* Entrance: scale + fade in (parked until revealed). */
        .dock-cta__btn {
          opacity: 0;
          transform: scale(0.9);
          transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);
        }
        .dock-cta__btn.is-revealed { opacity: 1; transform: none; }
        /* Floating on the same edge inset as the footer gutter so it docks with no
           sideways jump. MOBILE: bottom-LEFT (matches the left-aligned footer CTA);
           DESKTOP: bottom-right (matches the right-aligned footer CTA). */
        .dock-cta__btn.is-floating {
          position: fixed;
          left: 20px;
          bottom: 20px;
          z-index: 30;
        }
        /* Docked: settles into the slot and scrolls away with the footer, anchored
           to the same edge as the float so the swap never shifts sideways. */
        .dock-cta__btn.is-docked {
          position: absolute;
          top: 0;
          left: 0;
        }
        @media (min-width: 640px) {
          .dock-cta__btn.is-floating { left: auto; right: 28px; bottom: 28px; }
          .dock-cta__btn.is-docked { left: auto; right: 0; }
        }
      `}</style>
    </div>
  );
}
