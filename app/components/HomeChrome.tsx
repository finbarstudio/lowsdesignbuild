"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { nav } from "@/app/lib/site";

// Logotype aspect ratio (viewBox 121.71 × 55.33).
const RATIO = 121.71 / 55.33;
const BAR = 64; // bar height (h-16), matches the inner-page header

/**
 * Home chrome: a nav centred in a top bar (same structure as the inner-page
 * header), a mobile menu, and the logo that starts big and centred near the
 * bottom of the hero and, on scroll, travels up to dock centred in the bar.
 * White over the hero, ink once the bar clears the (possibly taller) hero.
 */
export default function HomeChrome({
  projectCount,
}: {
  projectCount?: number;
}) {
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const whiteRef = useRef<HTMLImageElement>(null);
  const inkRef = useRef<HTMLImageElement>(null);
  const barInnerRef = useRef<HTMLDivElement>(null);
  const barBgRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const barInner = barInnerRef.current;
    if (!wrap || !barInner) return;
    wrap.style.transformOrigin = "0 0";

    let raf = 0;
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const edge = vw >= 640 ? 24 : 16;
      const baseW = Math.min(vw * 0.52, 400);
      const baseH = baseW / RATIO;
      wrap.style.width = `${baseW}px`;

      // Hero may be taller than the viewport (desktop) or shorter (a landscape
      // image on a narrow phone), anchor the wordmark to the visible hero.
      const hero = document.getElementById("home-hero");
      const heroH = hero ? hero.offsetHeight : vh;

      const p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.7)));
      const targetH = 34; // docked logo height (30% larger than the old 26)
      const s = 1 + (targetH / baseH - 1) * p;

      // The wordmark starts bottom-left of the hero and travels straight up to
      // dock top-left in the bar. transformOrigin is the top-left corner (0 0),
      // so we interpolate that corner directly, left-aligned throughout.
      const x = edge;
      const y0 = Math.min(vh, heroH) - edge - baseH; // bottom of the hero
      const y1 = (BAR - targetH) / 2; // vertically centred in the bar
      const y = y0 + (y1 - y0) * p;
      wrap.style.transform = `translate(${x}px, ${y}px) scale(${s})`;

      // grey overlay over the hero, comes softly but fully in past 5% scroll.
      const overlay = document.getElementById("hero-overlay");
      if (overlay) {
        overlay.style.opacity = window.scrollY > vh * 0.05 ? "0.5" : "0";
      }

      // colour: white over the hero, ink once the bar clears the hero section.
      const dark = window.scrollY >= heroH - BAR;
      if (whiteRef.current) whiteRef.current.style.opacity = dark ? "0" : "1";
      if (inkRef.current) inkRef.current.style.opacity = dark ? "1" : "0";
      barInner.style.color = dark ? "rgb(66,73,82)" : "rgb(255,255,255)";
      if (barBgRef.current) barBgRef.current.style.opacity = dark ? "1" : "0";
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
    <>
      {/* bar */}
      <div className="fixed inset-x-0 top-0 z-40 h-16">
        <div
          ref={barBgRef}
          style={{ opacity: 0 }}
          className="absolute inset-0 transition-opacity duration-300"
        />
        <div
          ref={barInnerRef}
          className="relative mx-auto flex h-full w-full max-w-[1900px] items-center px-4 transition-colors duration-300 sm:px-6"
          style={{ color: "rgb(255,255,255)" }}
        >
          {/* desktop nav, top right */}
          <nav className="ml-auto hidden items-center gap-x-7 font-sans text-sm sm:flex sm:text-base">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="link-underline">{item.label}</span>
                {item.href === "/projects" && projectCount ? (
                  <sup className="ml-0.5 text-[0.6em] font-medium">
                    {projectCount}
                  </sup>
                ) : null}
              </Link>
            ))}
          </nav>

          {/* mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto sm:hidden"
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block h-px w-6 bg-current ${i ? "mt-1.5" : ""}`}
              />
            ))}
          </button>
        </div>
      </div>

      {/* mobile menu panel */}
      {open && (
        <nav className="fixed inset-x-0 top-16 z-40 flex flex-col gap-1 border-b border-line bg-background px-4 py-4 font-sans text-base text-ink sm:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-1.5"
            >
              {item.label}
              {item.href === "/projects" && projectCount ? (
                <sup className="ml-0.5 text-[0.6em] font-medium">
                  {projectCount}
                </sup>
              ) : null}
            </Link>
          ))}
        </nav>
      )}

      {/* scroll-linked logo (white over hero → ink on the bar) */}
      <Link
        ref={wrapRef}
        href="/"
        aria-label="Lows Design and Build, home"
        className="fixed left-0 top-0 z-50 block"
      >
        <span className="relative block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={inkRef}
            src="/logotype.svg"
            alt="Lows Design and Build"
            style={{ opacity: 0 }}
            className="block w-full transition-opacity duration-300 will-change-transform"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={whiteRef}
            src="/logotype.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full brightness-0 invert transition-opacity duration-300"
          />
        </span>
      </Link>
    </>
  );
}
