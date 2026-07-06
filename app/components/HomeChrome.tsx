"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Logomark from "@/app/components/Logomark";
import MobileMenu from "@/app/components/MobileMenu";
import { nav, site } from "@/app/lib/site";
import { smoothScrollTop } from "@/app/lib/scrollTop";

// True only for the very first home mount after a real document load (when the
// preloader runs). Stays false for client-side returns to home within the same
// page session — so we don't wait for a preloader that won't show.
let homeFullLoad = true;

const BAR = 64; // bar height (h-16)

// One shared edge inset for the three fixed anchors (nav right, logomark
// top-left, CTA bottom-right) so they all line up on the same gutter.
const EDGE = "px-5 sm:px-7";

type Mode = "hero" | "ink" | "footer";

/**
 * Home chrome — deliberately simple.
 *
 * - The house LOGOMARK sits top-left in the bar, STATIC, always (matching
 *   Header.tsx on the other pages). No scroll-linked motion, no docking, no
 *   wordmark→mark crossfade. The hero wordmark itself lives on the hero in
 *   page.tsx and never moves on scroll.
 * - The nav (right), the logomark (left) and the "Get an instant quote" CTA
 *   (bottom-right) all sit on the SAME viewport edge padding (EDGE).
 * - Colour still tracks scroll position: white over the hero, ink over the
 *   content, gold once the footer is reached.
 * - Entrance: on a fresh load the keyhole preloader reveals the hero first, then
 *   fires `preloader:done`; we stage the chrome in with explicit, budgeted delays
 *   — logomark → nav → CTA — so the whole thing finishes well under 4s. Fail-open
 *   throughout (a safety timer always fires the reveal).
 * - The CTA hands off to the footer: at the footer the fixed CTA fades + drops
 *   away and the footer's own static InstantQuoteButton takes over — a pure
 *   crossfade, no rect-measuring, so nothing jitters under Lenis.
 */
export default function HomeChrome({
  projectCount,
}: {
  projectCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("hero");
  // `entered` gates the staggered chrome reveal. On a FRESH document load it
  // starts false (items parked) and flips when the preloader lifts. On a
  // client-side return to home there's no preloader — start true, so the chrome
  // is simply there, instantly, with no re-entrance. (Server always renders
  // false; client-side mounts don't hydrate, so there's no mismatch.)
  const [entered, setEntered] = useState(() => !homeFullLoad);

  // ---- Entrance (Take B: an explicit JS-driven timeline fired when the
  // preloader lifts) -----------------------------------------------------------
  // The chrome items (logomark, nav, CTA) are staged in React via `entered` +
  // per-item transition-delays below. The mobile HERO WORDMARK lives in page.tsx
  // (a server component), so we also toggle the CSS `entrance-armed`/`entrance-go`
  // hooks on <html> to reveal it in the same beat — no props needed there.
  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let fired = false;
    const start = () => {
      if (fired) return;
      fired = true;
      setEntered(true);
      html.classList.add("entrance-go");
    };

    const fresh = homeFullLoad;
    homeFullLoad = false;

    // INSTANT paths — reduced motion, a client-side return to home, or no
    // preloader running (e.g. the session started on another page): no waiting,
    // no stagger. `entrance-fast` zeroes the hero wordmark's transition so it's
    // simply there.
    if (reduce || !fresh || !document.querySelector(".preloader")) {
      html.classList.add("entrance-fast");
      start();
      return;
    }
    html.classList.remove("entrance-fast");

    // Fresh document load with the preloader: wait for it to lift, THEN stage
    // the chrome. If it already lifted before this listener attached, the global
    // flag lets us catch up immediately (closes that race).
    if (
      (window as unknown as { __lowsPreloaderLifted?: boolean })
        .__lowsPreloaderLifted
    ) {
      start();
    }
    window.addEventListener("preloader:done", start, { once: true });

    // Fail-open safety net: never let the chrome stay hidden even if the
    // preloader event never arrives (stalled tab, JS edge cases). Sits just past
    // the preloader's own end (~2.34s) so it only ever catches a genuine stall.
    const safety = window.setTimeout(start, 3000);

    return () => {
      window.removeEventListener("preloader:done", start);
      window.clearTimeout(safety);
    };
  }, []);

  // ---- Scroll: colour mode, hero depth, and the CTA→footer dock hand-off -----
  useEffect(() => {
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

      // Hero image: PARALLAX on scroll (the image slides down at a fraction of
      // the scroll speed, so it lags behind the section) plus the existing
      // depth-recede (drift + fade) as you scroll on. The downward slide can
      // never reveal an edge: the section's visible top is always deeper into
      // the image than the parallax offset.
      const heroImg = document.getElementById("home-hero-img");
      if (heroImg) {
        const vh = window.innerHeight;
        const q = Math.min(
          1,
          Math.max(0, (window.scrollY - vh * 0.1) / (vh * 0.75)),
        );
        const eq = q * q * (3 - 2 * q); // smoothstep
        const par = window.scrollY * 0.25;
        heroImg.style.transform = `translate3d(0, ${(par - eq * 20).toFixed(1)}px, 0) scale(1.06)`;
        heroImg.style.opacity = `${(1 - 0.4 * eq).toFixed(3)}`;
      }

      // The CTA→footer hand-off is a pure crossfade driven by `mode === "footer"`
      // in the JSX below (fade + drop the fixed CTA, footer's static button takes
      // over) — no rect-measuring here, so nothing jitters under Lenis.
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

  // The bar stays native (transparent) even when the mobile menu is open — the
  // logo + hamburger just take the scroll-tracked colour.
  const barColor = textColor;

  // Staggered entrance MASK reveal: each item is parked below its own clip
  // (translate-y past 100%) until `entered`, then rises up into view with its own
  // delay. `rise()` is the moving inner element; wrap it in `overflow-hidden`.
  const rise = "inline-block transition-transform duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
  const risePos = entered ? "translate-y-0" : "translate-y-[130%]";
  const fade = (delay: number) =>
    `transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
      entered ? "opacity-100 scale-100" : "opacity-0 scale-90"
    } [transition-delay:${delay}ms]`;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-300">
        <div
          className={`relative mx-auto flex h-full w-full max-w-[1900px] items-center ${EDGE}`}
        >
          {/* logo left — mask-reveals up on entrance */}
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTop();
            }}
            className={`flex items-center overflow-hidden py-1 transition-colors duration-300 ${barColor}`}
          >
            <span
              className={`${rise} ${risePos}`}
              style={{ transitionDelay: "80ms" }}
            >
              <Logomark className="h-[26px] w-[37px]" />
            </span>
          </Link>

          {/* desktop nav, top right — each item mask-reveals, staggered */}
          <nav
            className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${textColor}`}
          >
            {nav.map((navItem, i) => (
              // The clip lives on an INNER span around the label only (so the
              // superscript is never cut off), and the Link stays INLINE — not
              // flex — exactly like Header.tsx, so the <sup> keeps its native
              // superscript alignment and its hover scale reads identically to
              // every other nav.
              <Link
                key={navItem.href}
                href={navItem.href}
                className="lu-group group"
              >
                {/* overflow-CLIP (not hidden — hidden moves an inline box's
                    baseline to its bottom edge, which shifted the whole label
                    and sup out of line with the other navs). The pb + negative
                    mb keep the hover underline inside the clip with zero
                    layout impact, so the geometry is identical to Header.tsx. */}
                <span className="inline-block overflow-clip pb-[3px] [margin-bottom:-3px]">
                  <span
                    className={`${rise} ${risePos} link-underline is-tracked`}
                    style={{ transitionDelay: `${220 + i * 90}ms` }}
                  >
                    {navItem.label}
                  </span>
                </span>
                {navItem.href === "/projects" && projectCount ? (
                  <sup
                    className={`ml-0.5 inline-block font-mono text-[0.62em] font-bold leading-none tracking-[0.06em] text-copper transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:-translate-y-0.5 group-hover:scale-[1.2] ${
                      entered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {projectCount}
                  </sup>
                ) : null}
              </Link>
            ))}
          </nav>

          {/* mobile menu button — fades + scales in */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`ml-auto flex h-12 w-12 flex-col items-center justify-center transition-colors duration-300 sm:hidden ${barColor} ${fade(200)}`}
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

      {/* mobile menu — right drawer */}
      <MobileMenu open={open} onClose={() => setOpen(false)} />

      {/* The "Get an instant quote" CTA is a single instance that lives in the
          footer and floats/docks itself (see DockingCta) — no copy here. */}
    </>
  );
}
