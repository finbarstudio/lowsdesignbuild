"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals its children with the wipe token (clip-path top→bottom) when it
 * scrolls into view — no opacity or scale, just the reveal.
 */
export default function WipeReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    // Reveal only once the element is in view AND its images have decoded, so
    // the wipe always uncovers the actual photo — never an empty placeholder
    // box that then flashes when the image pops in.
    const imagesReady = () => {
      const imgs = Array.from(el.querySelectorAll("img"));
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    };

    let raf = 0;
    let fallback = 0;
    const reveal = () => {
      setShown(true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(fallback);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.85 && r.bottom > 0;
      if (!inView) return;
      if (imagesReady()) {
        reveal();
      } else if (!fallback) {
        // Safety net: if the image is slow or fails to load, reveal anyway
        // after a short grace period so content is never stuck hidden.
        fallback = window.setTimeout(reveal, 1200);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // re-check when each image finishes decoding (load may land after the
    // scroll settles, so a scroll event alone wouldn't re-fire the check)
    const imgs = Array.from(el.querySelectorAll("img"));
    imgs.forEach((img) => img.addEventListener("load", onScroll));
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      imgs.forEach((img) => img.removeEventListener("load", onScroll));
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${shown ? "wipe-shown" : "wipe-hidden"} ${className}`}
    >
      {children}
    </div>
  );
}
