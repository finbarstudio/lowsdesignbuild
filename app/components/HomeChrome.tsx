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
  // `entered` gates the staggered chrome reveal. Starts false so the items are
  // parked (translated/faded), flips true when the timeline fires.
  const [entered, setEntered] = useState(false);

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
      html.classList.remove("entrance-armed");
      html.classList.add("entrance-go");
    };

    // Reduced motion: show everything at once, no stagger, no armed state.
    if (reduce) {
      homeFullLoad = false;
      start();
      return;
    }

    // Arm the hero wordmark (parks it) until we fire `go`.
    html.classList.add("entrance-armed");

    const fresh = homeFullLoad;
    homeFullLoad = false;

    // Client-side return: no preloader — reveal almost immediately.
    if (!fresh) {
      const t = window.setTimeout(start, 60);
      return () => {
        window.clearTimeout(t);
      };
    }

    // Fresh document load: wait for the preloader to lift, THEN stage the chrome.
    // If it already lifted before this listener attached, the global flag lets
    // us catch up immediately (closes that race).
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
    const safety = window.setTimeout(start, 2800);

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

      // Hero image holds for the first ~10% of scroll, then recedes (scale
      // down + drift up + fade) so it falls away with depth as you scroll on.
      const heroImg = document.getElementById("home-hero-img");
      if (heroImg) {
        const vh = window.innerHeight;
        const q = Math.min(
          1,
          Math.max(0, (window.scrollY - vh * 0.1) / (vh * 0.75)),
        );
        const eq = q * q * (3 - 2 * q); // smoothstep
        heroImg.style.transform = `translate3d(0, ${(-eq * 20).toFixed(1)}px, 0) scale(1.06)`;
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

  // When the mobile menu is open the bar gets a solid background, so the logo +
  // hamburger must read ink rather than white-over-hero.
  const barColor = open ? "text-ink" : textColor;

  // Staggered entrance: each item is parked (opacity 0 + a small offset) until
  // `entered`, then eased in with its own delay. Total run ~1.2s → comfortably
  // inside the 4s budget after the ~2.24s preloader.
  const item = (delay: string) =>
    `transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
      entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
    } ${delay}`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-300 ${
          open ? "bg-background" : ""
        }`}
      >
        <div
          className={`relative mx-auto flex h-full w-full max-w-[1900px] items-center ${EDGE}`}
        >
          {/* logo left — the static house mark, always (like Header.tsx) */}
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTop();
            }}
            className={`flex items-center transition-colors duration-300 ${barColor} ${item("[transition-delay:0ms]")}`}
          >
            <Logomark className="h-[26px] w-[37px]" />
          </Link>

          {/* desktop nav, top right */}
          <nav
            className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${textColor} ${item("[transition-delay:140ms]")}`}
          >
            {nav.map((navItem) => (
              <Link key={navItem.href} href={navItem.href} className="lu-group group">
                <span className="link-underline is-tracked">
                  {navItem.label}
                </span>
                {navItem.href === "/projects" && projectCount ? (
                  <sup className="ml-0.5 inline-block font-mono text-[0.62em] font-bold leading-none tracking-[0.06em] text-copper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-[1.6]">
                    {projectCount}
                  </sup>
                ) : null}
              </Link>
            ))}
          </nav>

          {/* mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`ml-auto flex h-12 w-12 flex-col items-center justify-center transition-colors duration-300 sm:hidden ${barColor} ${item("[transition-delay:140ms]")}`}
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
