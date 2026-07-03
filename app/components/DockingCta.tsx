"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import InstantQuoteButton from "@/app/components/InstantQuoteButton";

/**
 * The single "Get an instant quote" button. There is only ONE instance: it lives
 * in the footer's CTA slot, and ON THE HOME PAGE it floats bottom-right while you
 * scroll, then docks into its footer slot when you reach the bottom — and from
 * there scrolls away with the footer. No second (floating) copy.
 *
 * The dock is seamless because the floating inset (20/28px) and the footer's own
 * gutter (20/28px, matched to the nav edge) put the floating button and the
 * docked slot on the exact same right edge; we simply switch from `fixed` to
 * `absolute` the instant the slot rises to the floating line, so nothing jumps.
 *
 * Off the home page there is no floating behaviour — the button just sits in the
 * footer statically (as before).
 */
export default function DockingCta() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const slotRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(true);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!isHome) return;
    const slot = slotRef.current;
    const btn = btnRef.current;
    if (!slot || !btn) return;

    const pill = () => btn.querySelector<HTMLElement>(".btn-spotlight");

    const measure = () => {
      const p = pill();
      if (p) setSize({ w: p.offsetWidth, h: p.offsetHeight });
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

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isHome]);

  // Off home: a plain static button in the footer slot.
  if (!isHome) return <InstantQuoteButton />;

  return (
    <div
      ref={slotRef}
      className="dock-cta"
      style={size ? { width: size.w, height: size.h } : undefined}
    >
      <div
        ref={btnRef}
        className={`dock-cta__btn ${floating ? "is-floating" : "is-docked"}`}
      >
        <InstantQuoteButton />
      </div>
      <style>{`
        .dock-cta { position: relative; }
        /* Floating: pinned to the viewport bottom-right on the same edge inset as
           the nav / footer gutter, so it docks without a horizontal jump. */
        .dock-cta__btn.is-floating {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 30;
        }
        /* Docked: settles into the slot and scrolls away with the footer. */
        .dock-cta__btn.is-docked {
          position: absolute;
          top: 0;
          left: 0;
        }
        @media (min-width: 640px) {
          .dock-cta__btn.is-floating { right: 28px; bottom: 28px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dock-cta__btn.is-floating { position: fixed; }
        }
      `}</style>
    </div>
  );
}
