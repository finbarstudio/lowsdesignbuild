"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Wordmark from "@/app/components/Wordmark";
import { nav, site } from "@/app/lib/site";

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

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16">
      <div className="relative mx-auto flex h-full w-full max-w-[1900px] items-center px-4 sm:px-6">
        {/* logo left */}
        <Link
          href="/"
          aria-label={`${site.name}, home`}
          className={`flex items-center transition-colors duration-300 ${textColor}`}
        >
          <Wordmark className="h-[26px] w-[57px]" />
        </Link>

        {/* nav right */}
        <nav
          className={`ml-auto hidden items-center gap-x-7 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 sm:flex sm:text-sm ${textColor}`}
        >
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <span className={active ? "link-underline link-active" : "link-underline"}>
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
          className={`-mr-2 ml-auto flex h-11 w-11 flex-col items-end justify-center transition-colors duration-300 sm:hidden ${textColor}`}
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

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-background px-4 py-4 font-mono text-sm uppercase tracking-[0.12em] text-ink sm:hidden">
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
