"use client";

import { useEffect, useRef, useState } from "react";

import WordReveal from "@/app/components/WordReveal";

const BAR = 64;
type Mode = "hero" | "ink" | "footer";

/**
 * The project h1. It starts large at the bottom of the hero and, as you scroll,
 * physically travels up and scales down to sit small and centred in the nav bar,
 * taking the same scroll-driven colour as the logo (white over hero, ink over
 * content, tertiary at the footer). On mobile it simply scrolls away with the
 * hero (no docking, to avoid colliding with the logo/menu button).
 */
export default function ProjectHeroTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const dims = useRef({ w: 0, h: 0 });
  const [mode, setMode] = useState<Mode>("hero");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transformOrigin = "0 0";
    let raf = 0;

    const update = () => {
      const { w: nW, h: nH } = dims.current;
      if (!nH) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const padX = vw >= 640 ? 24 : 16;
      const y0 = vh - 32 - nH; // resting at the bottom of the hero

      if (vw < 640) {
        // mobile: just scroll up and away with the page
        el.style.transform = `translate(${padX}px, ${(y0 - y).toFixed(1)}px) scale(1)`;
      } else {
        // desktop: travel up + scale down into the centre of the bar
        const p = Math.min(1, Math.max(0, y / (vh * 0.7)));
        const targetH = 34;
        const s = 1 + (targetH / nH - 1) * p;
        const x1 = (vw - nW * (targetH / nH)) / 2; // centred once scaled
        const y1 = (BAR - targetH) / 2;
        const x = padX + (x1 - padX) * p;
        const yy = y0 + (y1 - y0) * p;
        el.style.transform = `translate(${x.toFixed(1)}px, ${yy.toFixed(1)}px) scale(${s.toFixed(3)})`;
      }

      const footer = document.getElementById("site-footer");
      const atFooter = footer ? y + BAR >= footer.offsetTop : false;
      const dark = y >= vh - BAR;
      setMode(atFooter ? "footer" : dark ? "ink" : "hero");
    };

    const measure = () => {
      const prev = el.style.transform;
      el.style.transform = "none";
      dims.current = { w: el.offsetWidth, h: el.offsetHeight };
      el.style.transform = prev;
      update();
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  const color =
    mode === "footer" ? "#a97e1f" : mode === "hero" ? "#ffffff" : "#424952";

  return (
    <h1
      ref={ref}
      style={{ color, maxWidth: "min(92vw, 60rem)" }}
      className="serif fixed left-0 top-0 z-50 text-4xl leading-[1.02] will-change-transform sm:text-6xl lg:text-7xl"
    >
      <WordReveal text={title} />
    </h1>
  );
}
