"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Logomark from "@/app/components/Logomark";
import MobileMenu from "@/app/components/MobileMenu";
import { nav, site } from "@/app/lib/site";
import { smoothScrollTop } from "@/app/lib/scrollTop";

const BAR = 64;

export default function Header({ projectCount }: { projectCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  // Project detail pages have a full-screen hero: white logo + nav over it,
  // switching to ink once scrolled past it.
  const isProjectDetail =
    Boolean(pathname?.startsWith("/projects/")) && pathname !== "/projects";

  useEffect(() => {
    const f = () => {
      const threshold = isProjectDetail ? window.innerHeight - BAR : 40;
      setScrolled(window.scrollY > threshold);
      const footer = document.getElementById("site-footer");
      setAtFooter(footer ? window.scrollY + BAR >= footer.offsetTop : false);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => {
      window.removeEventListener("scroll", f);
      window.removeEventListener("resize", f);
    };
  }, [isProjectDetail]);

  if (pathname?.startsWith("/studio")) return null;
  // The home page has its own bespoke chrome (HomeChrome), no global header.
  if (pathname === "/") return null;

  const overHero = isProjectDetail && !scrolled;
  const textColor = atFooter
    ? "text-tertiary"
    : overHero
      ? "text-white"
      : "text-ink";
  // when the mobile menu is open the bar has a solid bg, so force ink
  const barColor = open ? "text-ink" : textColor;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-300 ${
        open ? "bg-background" : ""
      }`}
    >
      <div className="relative mx-auto flex h-full w-full max-w-[1900px] items-center px-4 sm:px-6">
        {/* logo left — just the house mark */}
        <Link
          href="/"
          aria-label={`${site.name}, home`}
          className={`flex items-center transition-colors duration-300 ${barColor}`}
        >
          <Logomark className="h-[26px] w-[37px]" />
        </Link>

        {/* nav right */}
        <nav
          className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${textColor}`}
        >
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const isCurrent = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (isCurrent) {
                    e.preventDefault();
                    smoothScrollTop();
                  }
                }}
              >
                <span
                  className={`link-underline is-tracked ${active ? "link-active" : ""}`}
                >
                  {item.label}
                </span>
                {item.href === "/projects" && projectCount ? (
                  <sup className="ml-0.5 text-[0.6em] font-medium">
                    {projectCount}
                  </sup>
                ) : null}
              </Link>
            );
          })}
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

      {/* mobile menu — right drawer */}
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
