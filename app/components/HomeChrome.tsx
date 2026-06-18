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
    wrap.style.willChange = "transform";

    const targetH = 26; // docked logo height

    // Layout-dependent values are expensive to read (they force reflow), so we
    // measure them once here and only on resize — never inside the per-frame
    // scroll handler. That keeps the scroll path to cheap maths on mobile.
    let vh = 0;
    let baseH = 0;
    let y0 = 0;
    let scrollSpan = 1; // px of scroll over which the dock animates
    let heroDarkPoint = 0; // scrollY at which chrome flips to ink
    const y1 = (BAR - targetH) / 2; // vertically centred in the bar

    const measure = () => {
      const vw = window.innerWidth;
      vh = window.innerHeight;
      const edge = vw >= 640 ? 24 : 16;
      const baseW = Math.min(vw * 0.52, 400);
      baseH = baseW / RATIO;
      wrap.style.width = `${baseW}px`;
      wrap.style.left = `${edge}px`;

      const hero = document.getElementById("home-hero");
      const heroH = hero ? hero.offsetHeight : vh;
      y0 = Math.min(vh, heroH) - edge - baseH; // bottom of the visible hero
      scrollSpan = vh * 0.7;
      heroDarkPoint = heroH - BAR;
    };

    let raf = 0;
    let lastDark: boolean | null = null;
    const update = () => {
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0, y / scrollSpan));
      const s = 1 + (targetH / baseH - 1) * p;
      const ty = y0 + (y1 - y0) * p;
      // translate3d keeps the wordmark on its own GPU layer; left is fixed via
      // the style above so the transform only carries the vertical travel.
      wrap.style.transform = `translate3d(0, ${ty}px, 0) scale(${s})`;

      const overlay = document.getElementById("hero-overlay");
      if (overlay) overlay.style.opacity = y > vh * 0.05 ? "0.5" : "0";

      // colour: white over the hero, ink once the bar clears the hero section.
      // Only touch the DOM when the state actually changes.
      const dark = y >= heroDarkPoint;
      if (dark !== lastDark) {
        lastDark = dark;
        if (whiteRef.current) whiteRef.current.style.opacity = dark ? "0" : "1";
        if (inkRef.current) inkRef.current.style.opacity = dark ? "1" : "0";
        barInner.style.color = dark ? "rgb(66,73,82)" : "rgb(255,255,255)";
        if (barBgRef.current) barBgRef.current.style.opacity = dark ? "1" : "0";
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
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
            className="-mr-2 ml-auto flex h-11 w-11 flex-col items-end justify-center sm:hidden"
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
              className="py-3"
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
