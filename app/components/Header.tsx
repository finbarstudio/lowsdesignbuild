"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { nav, site } from "@/app/lib/site";

export default function Header({ projectCount }: { projectCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Project detail pages have a full-screen hero: white logo + nav over it,
  // switching to ink once the page has scrolled past the hero image.
  const isProjectDetail =
    Boolean(pathname?.startsWith("/projects/")) && pathname !== "/projects";

  useEffect(() => {
    const f = () => {
      // On a project detail page stay "over hero" until the hero image clears
      // the top bar; elsewhere a small threshold is enough.
      const threshold = isProjectDetail ? window.innerHeight - 64 : 40;
      setScrolled(window.scrollY > threshold);
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

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16">

      <div className="relative mx-auto flex h-full w-full max-w-[1900px] items-center px-4 sm:px-6">
        {/* logo left */}
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

        {/* nav right */}
        <nav
          className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${
            overHero ? "text-white" : "text-ink"
          }`}
        >
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={active ? "link-draw link-draw-active" : "link-draw"}
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

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-background px-4 py-4 font-mono text-sm uppercase tracking-[0.12em] sm:hidden">
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
    </header>
  );
}
