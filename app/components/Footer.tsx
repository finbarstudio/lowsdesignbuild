import { site } from "@/app/lib/site";

const YEAR = 2026;

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 21v-7.3h2.45l.37-2.84H13.5V9.04c0-.82.23-1.38 1.41-1.38h1.5V5.12a20.3 20.3 0 0 0-2.19-.11c-2.17 0-3.65 1.32-3.65 3.76v2.1H8.1v2.83h2.48V21h2.92z" />
    </svg>
  );
}

// Full-height (100vh) footer in Space Mono: a 1px red rule near the top, a tall
// stretch of open space, then a sparse grid of essentials sitting just above
// the LOWS wordmark, which runs full-width flush along the bottom.
export default function Footer() {
  return (
    <footer className="flex h-[100svh] min-h-[560px] flex-col overflow-hidden font-mono text-tertiary">
      {/* 1px red hairline across the top */}
      <div className="px-4 pt-8 sm:px-6 sm:pt-10">
        <hr className="border-0 border-t border-tertiary" />
      </div>

      <div className="mt-auto px-4 sm:px-6">
        <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-8 text-xs sm:mb-10 sm:grid-cols-12">
          {/* credit */}
          <div className="sm:col-span-3">
            <p>
              ©{YEAR} {site.name}
            </p>
            <a
              href="https://www.finbar.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block"
            >
              Site by <span className="link-underline">finbar.studio</span>
            </a>
          </div>

          {/* contact */}
          <div className="sm:col-span-4 sm:col-start-5">
            <p>South London</p>
            <a href={site.phoneHref} className="link-underline mt-2 block">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="link-underline block">
              {site.email}
            </a>
          </div>

          {/* social icons */}
          <div className="flex items-start gap-4 sm:col-span-3 sm:col-start-10 sm:justify-end">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-opacity hover:opacity-60"
            >
              <InstagramIcon />
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-opacity hover:opacity-60"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>

        {/* LOWS wordmark, full width, flush to the bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lows.svg"
          alt={site.name}
          className="block w-full translate-y-[1.5%]"
        />
      </div>
    </footer>
  );
}
