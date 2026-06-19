import FooterRule from "@/app/components/FooterRule";
import { site } from "@/app/lib/site";

const YEAR = 2026;

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[1.05em] w-[1.05em] shrink-0"
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
      className="h-[1.05em] w-[1.05em] shrink-0"
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
    <footer
      id="site-footer"
      className="flex h-[100svh] min-h-[560px] flex-col overflow-hidden font-mono text-tertiary"
    >
      {/* 1px hairline — sits at the nav-bar height (64px) so the nav items above
          it read as properly padded; draws left→right once the footer appears */}
      <div className="px-4 pt-16 sm:px-6">
        <FooterRule />
      </div>

      <div className="mt-auto px-4 sm:px-6">
        <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-8 text-xs leading-relaxed sm:mb-10 sm:grid-cols-12">
          {/* left: location + contact */}
          <div className="flex flex-col items-start sm:col-span-4">
            <p>South London</p>
            <a href={site.phoneHref} className="link-underline">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="link-underline">
              {site.email}
            </a>
          </div>

          {/* middle: socials — icon inline with its label */}
          <div className="flex flex-col items-start sm:col-span-4 sm:col-start-5">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <InstagramIcon />
              <span className="link-underline">Instagram</span>
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <FacebookIcon />
              <span className="link-underline">Facebook</span>
            </a>
          </div>

          {/* right: credit */}
          <div className="flex flex-col items-start sm:col-span-3 sm:col-start-10 sm:items-end sm:text-right">
            <p>
              ©{YEAR} {site.name}
            </p>
            <a
              href="https://www.finbar.studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              Site by <span className="link-underline">finbar.studio</span>
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
