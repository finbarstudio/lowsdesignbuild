import { site } from "@/app/lib/site";

const YEAR = 2026;

// Full-height (100vh) footer: a sparse Swiss grid of essentials sitting just
// above the LOWS wordmark, which runs full-width flush along the bottom.
export default function Footer() {
  return (
    <footer className="flex h-screen flex-col justify-end overflow-hidden text-tertiary">
      <div className="px-4 sm:px-6">
        {/* minimal info, swiss grid */}
        <div className="mb-8 grid grid-cols-2 gap-y-6 text-sm sm:mb-10 sm:grid-cols-12">
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
          <p className="sm:col-span-3 sm:col-start-6">South London</p>
          <div className="text-right sm:col-span-3 sm:col-start-10">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <span className="link-underline">Instagram</span>
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
