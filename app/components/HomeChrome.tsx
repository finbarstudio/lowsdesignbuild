"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { nav, site } from "@/app/lib/site";

/**
 * Home chrome: a top bar with the wordmark docked left and the nav right —
 * the same structure as the inner-page header. The logo stays put at the top
 * (no scroll-linked travel); it's white over the hero and flips to ink once
 * the bar clears the hero image, when the paper bar background fades in.
 */
export default function HomeChrome({
  projectCount,
}: {
  projectCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("home-hero");
      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      setScrolled(window.scrollY >= heroH - 64);

      // grey overlay over the hero, comes softly but fully in past 5% scroll.
      const overlay = document.getElementById("hero-overlay");
      if (overlay) {
        overlay.style.opacity =
          window.scrollY > window.innerHeight * 0.05 ? "0.5" : "0";
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
          {/* wordmark, docked top-left */}
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            className="flex items-center"
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
            className={`ml-auto hidden items-center gap-x-7 font-sans text-sm transition-colors duration-300 sm:flex sm:text-base ${
              overHero ? "text-white" : "text-ink"
            }`}
          >
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
                className={`block h-px w-6 ${i ? "mt-1.5" : ""} ${
                  overHero ? "bg-white" : "bg-ink"
                }`}
              />
            ))}
          </button>
        </div>
      </header>

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
    </>
  );
}
