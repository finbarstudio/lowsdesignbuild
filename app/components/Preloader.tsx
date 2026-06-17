"use client";

import { usePathname } from "next/navigation";

/**
 * Path-trace preloader. The logo mark is a single <polyline>; we normalise its
 * length with pathLength={1} and animate stroke-dashoffset 1 → 0 to "draw" it,
 * then the overlay fades up to reveal the page. All timing lives in globals.css
 * (the .preloader* rules) so it's easy to tweak.
 *
 * Only shown on the home page — it's the site's entrance, not every route.
 */
export default function Preloader() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

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
