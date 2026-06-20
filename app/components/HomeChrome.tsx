"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Logomark from "@/app/components/Logomark";
import Wordmark from "@/app/components/Wordmark";
import { nav, site } from "@/app/lib/site";

// Logotype aspect ratio (viewBox 121.71 × 55.33).
const RATIO = 121.71 / 55.33;
// House-mark aspect ratio (viewBox 121.43 × 86.64).
const MARK_RATIO = 121.43 / 86.64;
const BAR = 64; // bar height (h-16)

type Mode = "hero" | "ink" | "footer";

/**
 * Home chrome.
 * - Desktop (sm+): the wordmark starts large near the bottom of the hero and
 *   travels up on scroll to dock top-left in the bar (scroll-linked).
 * - Mobile: a small static wordmark in the bar; the serif tagline carries the
 *   hero instead.
 * Colour by scroll position: white over the hero, ink over content, and the
 * tertiary red once the footer is reached.
 */
export default function HomeChrome({
  projectCount,
}: {
  projectCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("hero");
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);

  // Kick the entrance. Arm it (hide the hero + wordmark) on mount, then `go`
  // (reveal) once the preloader lifts on a fresh load — or almost immediately on
  // a client-side return. A safety timer guarantees the reveal always fires, so
  // the hero can never get stuck hidden.
  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("entrance-go")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    html.classList.add("entrance-armed");
    const go = () => html.classList.add("entrance-go");
    const hasPreloader = !!document.querySelector(".preloader");
    const t1 = window.setTimeout(go, hasPreloader ? 1600 : 80);
    const t2 = window.setTimeout(go, 3500); // safety net
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (wrap) wrap.style.transformOrigin = "0 0";
    let raf = 0;

    const update = () => {
      const hero = document.getElementById("home-hero");
      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      const footer = document.getElementById("site-footer");
      const atFooter = footer
        ? window.scrollY + BAR >= footer.offsetTop
        : false;
      const dark = window.scrollY >= heroH - BAR;
      setMode(atFooter ? "footer" : dark ? "ink" : "hero");

      // hero blurs progressively as you scroll into the page
      const overlay = document.getElementById("hero-overlay");
      if (overlay) {
        const bp = Math.min(
          1,
          Math.max(0, window.scrollY / (window.innerHeight * 0.45)),
        );
        const px = (bp * 16).toFixed(1);
        overlay.style.setProperty("backdrop-filter", `blur(${px}px)`);
        overlay.style.setProperty("-webkit-backdrop-filter", `blur(${px}px)`);
      }

      // hero image lags the scroll a touch (parallax) so the next section
      // appears to slide over it. The 1.06 scale gives headroom for the lag.
      const heroImg = document.getElementById("home-hero-img");
      if (heroImg) {
        // cap the lag at the headroom the 1.08 scale buys (≈3.5% each side) so
        // the downward shift never reveals an edge
        const lag = Math.min(window.scrollY * 0.28, heroH * 0.05);
        heroImg.style.transform = `translate3d(0, ${lag.toFixed(1)}px, 0) scale(1.12)`;
      }

      // desktop sliding wordmark — position only; colour comes from `mode`.
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
        const y0 = Math.min(vh, heroH) - edge - baseH; // bottom of the hero
        const y1 = (BAR - targetH) / 2; // centred in the bar
        const y = y0 + (y1 - y0) * p;

        // Once docked, the wordmark slides right to make room and the house mark
        // fades/lands in on its left, completing the full logo. Ramp this over
        // the last 30% of the dock so it reads as a distinct second beat.
        const markH = targetH;
        const markW = markH * MARK_RATIO;
        const gap = 12;
        const q = Math.min(1, Math.max(0, (p - 0.7) / 0.3));
        const eq = q * q * (3 - 2 * q); // smoothstep
        const xShift = (markW + gap) * eq;
        wrap.style.transform = `translate(${edge + xShift}px, ${y}px) scale(${s})`;

        const mark = markRef.current;
        if (mark) {
          mark.style.width = `${markW}px`;
          mark.style.height = `${markH}px`;
          mark.style.transform = `translate(${edge}px, ${y1}px)`;
          // slide in a touch from the left as it fades up
          mark.style.opacity = `${eq}`;
          mark.style.marginLeft = `${(1 - eq) * -8}px`;
        }
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

  const textColor =
    mode === "footer"
      ? "text-tertiary"
      : mode === "hero"
        ? "text-white"
        : "text-ink";

  // when the mobile menu is open the bar gets a solid background, so the
  // logo + button must read ink rather than white-over-hero
  const barColor = open ? "text-ink" : textColor;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-300 ${
          open ? "bg-background" : ""
        }`}
      >
        <div className="relative mx-auto flex h-full w-full max-w-[1900px] items-center px-4 sm:px-6">
          {/* mobile: static wordmark, docked top-left */}
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            className={`logo-mask flex items-center transition-colors duration-300 sm:hidden ${barColor}`}
          >
            <Wordmark className="h-[26px] w-[57px]" />
          </Link>

          {/* desktop nav, top right */}
          <nav
            className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${textColor}`}
          >
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="link-underline is-tracked">{item.label}</span>
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
            className={`ml-auto flex h-12 w-12 flex-col items-center justify-center transition-colors duration-300 sm:hidden ${barColor}`}
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
      </header>

      {/* desktop: scroll-linked sliding wordmark */}
      <Link
        ref={wrapRef}
        href="/"
        aria-label={`${site.name}, home`}
        className={`logo-mask fixed left-0 top-0 z-50 hidden transition-colors duration-300 will-change-transform sm:block ${textColor}`}
      >
        <Wordmark className="aspect-[121.71/55.33] w-full" />
      </Link>

      {/* desktop: the house mark that lands in beside the docked wordmark */}
      <span
        ref={markRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-50 hidden opacity-0 will-change-transform sm:block ${textColor}`}
      >
        <Logomark className="h-full w-full" />
      </span>

      {/* mobile menu panel */}
      {open && (
        <nav className="fixed inset-x-0 top-16 z-40 flex flex-col gap-1 border-b border-line bg-background px-4 py-4 font-mono text-sm uppercase tracking-[0.12em] text-ink sm:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="w-fit py-3"
            >
              <span className="link-underline">{item.label}</span>
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
