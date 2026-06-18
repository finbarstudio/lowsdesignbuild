"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Path-trace preloader. The logo mark is a single <polyline>; we normalise its
 * length with pathLength={1} and animate stroke-dashoffset 1 → 0 to "draw" it,
 * then the overlay fades up to reveal the page.
 *
 * Shown once per session, on the home page — the site's entrance. A
 * sessionStorage flag stops it replaying on every visit back to home.
 */
export default function Preloader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    if (sessionStorage.getItem("lows-preloaded")) return;
    sessionStorage.setItem("lows-preloaded", "1");
    setShow(true);
  }, []); // run once on mount

  if (!show) return null;

  return (
    <div className="preloader" aria-hidden="true">
      <svg
        className="preloader__logo"
        viewBox="0 0 121.43 86.64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          className="preloader__path"
          pathLength={1}
          points="2 84.64 2 56.06 27.52 38.21 27.52 3.23 96.77 37.67 96.77 3.59 49.38 3.59 49.38 84.64 71.25 84.64 71.25 55.88 119.43 55.88 119.43 84.64"
        />
      </svg>
    </div>
  );
}
