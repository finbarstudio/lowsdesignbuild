"use client";

import { useEffect, useRef } from "react";

/**
 * The pinned home slogan. It fades out as the first featured thumbnail rises to
 * cover it, and stays hidden behind the featured block (so it doesn't flash back
 * in the gaps between cards). Fades back in if you scroll up past it.
 */
export default function StickySlogan({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const card = document.querySelector<HTMLElement>("[data-featured-first]");
      if (!card) {
        el.style.opacity = "1";
        return;
      }
      const vh = window.innerHeight;
      const top = card.getBoundingClientRect().top;
      // Lingers: stays fully visible until the process section has risen to
      // ~0.35vh, then fades quickly just before it's covered (~0.12vh) — so the
      // slogan holds on screen noticeably longer while you scroll.
      const p = Math.min(1, Math.max(0, (vh * 0.35 - top) / (vh * 0.23)));
      el.style.opacity = `${(1 - p).toFixed(3)}`;
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

  return <div ref={ref}>{children}</div>;
}
