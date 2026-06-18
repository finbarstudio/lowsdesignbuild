"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { nav, site } from "@/app/lib/site";

// Logotype aspect ratio (viewBox 121.71 × 55.33).
const RATIO = 121.71 / 55.33;
const BAR = 64; // bar height (h-16)

/**
 * Home chrome.
 * - Desktop (sm+): the wordmark starts large near the bottom of the hero and
 *   travels up on scroll to dock top-left in the bar (scroll-linked).
 * - Mobile: no travel — a small static wordmark in the bar, and the editorial
 *   serif tagline (in page.tsx) carries the hero instead.
 * The wordmark is white over the hero and flips to ink once the bar clears it.
 */
export default function HomeChrome({
  projectCount,
}: {
  projectCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // sliding (desktop) wordmark refs
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const whiteRef = useRef<HTMLImageElement>(null);
  const inkRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (wrap) wrap.style.transformOrigin = "0 0";
    let raf = 0;

    const update = () => {
      const hero = document.getElementById("home-hero");
      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      const dark = window.scrollY >= heroH - BAR;
      setScrolled(dark);

      // grey overlay over the hero, comes softly but fully in past 5% scroll.
      const overlay = document.getElementById("hero-overlay");
      if (overlay) {
        overlay.style.opacity =
          window.scrollY > window.innerHeight * 0.05 ? "0.5" : "0";
      }

      // desktop sliding wordmark
      if (wrap && window.innerWidth >= 640) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const edge = 24;
        const baseW = Math.min(vw * 0.52, 460);
        const baseH = baseW / RATIO;
        wrap.style.width = `${baseW}px`;
        const p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.7)));
        const targetH = 26;
        const s = 1 + (targetH / baseH - 1) * p;
        const x = edge;
        const y0 = Math.min(vh, heroH) - edge - baseH; // bottom of the hero
        const y1 = (BAR - targetH) / 2; // centred in the bar
        const y = y0 + (y1 - y0) * p;
        wrap.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        if (whiteRef.current) whiteRef.current.style.opacity = dark ? "0" : "1";
        if (inkRef.current) inkRef.current.style.opacity = dark ? "1" : "0";
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
    };
  }, []);

  const overHero = !scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-300 ${
          scrolled ? "bg-background/85 backdrop-blur-sm" : ""
        }`}
      >
        <div className="relative mx-auto flex h-full w-full max-w-[1900px] items-center px-4 sm:px-6">
          {/* mobile: static wordmark, docked top-left (hidden on desktop, where
              the sliding wordmark takes over) */}
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            className="flex items-center sm:hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logotype.svg"
              alt={site.name}
              className={`h-[26px] w-auto transition-[filter] duration-300 ${
                overHero ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* desktop nav, top right */}
          <nav
            className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${
              overHero ? "text-white" : "text-ink"
            }`}
          >
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="link-draw">{item.label}</span>
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
                className={`block h-px w-6 ${i ? "mt-1.5" : ""} ${
                  overHero ? "bg-white" : "bg-ink"
                }`}
              />
            ))}
          </button>
        </div>
      </header>

      {/* desktop: scroll-linked sliding wordmark (white over hero → ink on bar) */}
      <Link
        ref={wrapRef}
        href="/"
        aria-label={`${site.name}, home`}
        className="fixed left-0 top-0 z-50 hidden sm:block"
      >
        <span className="relative block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={inkRef}
            src="/logotype.svg"
            alt={site.name}
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

      {/* mobile menu panel */}
      {open && (
        <nav className="fixed inset-x-0 top-16 z-40 flex flex-col gap-1 border-b border-line bg-background px-4 py-4 font-mono text-sm uppercase tracking-[0.12em] text-ink sm:hidden">
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
    </>
  );
}
