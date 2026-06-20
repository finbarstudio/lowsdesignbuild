"use client";

import { useEffect, useRef, useState } from "react";

import WordReveal from "@/app/components/WordReveal";

const BAR = 64;
const EDGE = 10; // tiny side breathing room when filling the width
const BOTTOM = 22; // bottom padding at rest
const NAV = 14; // docked size — same as the nav items
const REF = 100; // reference font-size we measure at
type Mode = "hero" | "ink" | "footer";

/**
 * The project h1 — bold caps (same face as the featured-project thumbnails). At
 * rest it's sized to fill the viewport width (whatever the title length); as you
 * scroll it shrinks to nav-item size and travels into the centre of the nav bar,
 * staying centred and taking the logo's scroll-driven colour. On mobile it fills
 * the width and simply scrolls away with the hero.
 */
export default function ProjectHeroTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const dims = useRef({ w: 0, h: 0 }); // measured at REF px
  const [mode, setMode] = useState<Mode>("hero");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transformOrigin = "0 0";
    let raf = 0;

    const update = () => {
      const { w: w0, h: h0 } = dims.current; // at REF px
      if (!w0) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const y = window.scrollY;

      // font-size that makes the line exactly fill the viewport width
      const fit = ((vw - 2 * EDGE) * REF) / w0;
      const mobile = vw < 640;
      const p = mobile ? 0 : Math.min(1, Math.max(0, y / (vh * 0.7)));

      const f = fit + (NAV - fit) * p; // rest → nav size
      const w = (w0 * f) / REF;
      const h = (h0 * f) / REF;
      const x = (vw - w) / 2; // centred
      const top0 = vh - BOTTOM - h; // anchored to the hero bottom
      const top1 = (BAR - h) / 2; // centred in the bar
      const top = mobile ? top0 - y : top0 + (top1 - top0) * p;

      el.style.fontSize = `${f.toFixed(2)}px`;
      el.style.transform = `translate(${x.toFixed(1)}px, ${top.toFixed(1)}px)`;

      const footer = document.getElementById("site-footer");
      const atFooter = footer ? y + BAR >= footer.offsetTop : false;
      const dark = y >= vh - BAR;
      setMode(atFooter ? "footer" : dark ? "ink" : "hero");
    };

    const measure = () => {
      el.style.transform = "none";
      el.style.fontSize = `${REF}px`;
      const w = el.offsetWidth;
      if (w > 0) dims.current = { w, h: el.offsetHeight };
      update();
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    // measure after paint, and again once the web font has loaded (its metrics
    // change the line width, so the fit-to-width size depends on it)
    requestAnimationFrame(measure);
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(measure);
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
      style={{ color }}
      className="fixed left-0 top-0 z-50 whitespace-nowrap font-sans font-bold uppercase leading-none tracking-tight will-change-transform"
    >
      <WordReveal text={title} />
    </h1>
  );
}
