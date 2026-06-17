import { site } from "@/app/lib/site";

const YEAR = 2026;

// MW.S-style footer: the Lows logo set large, filling a ~65vh band, with the
// credit / company / contact details tucked into the bottom corners.
export default function Footer() {
  return (
    <footer className="flex h-[65vh] min-h-[460px] flex-col justify-between px-4 pb-10 pt-16 sm:px-6">
      {/* giant logo — scales to fill the available height */}
      <div className="flex min-h-0 flex-1 items-center justify-center py-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logotype.svg"
          alt={site.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* bottom info */}
      <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
        <p>©{YEAR}</p>
        <div className="order-last col-span-2 sm:order-none sm:col-span-1">
          <p>{site.name}</p>
          <p className="text-muted">Family-run design &amp; build</p>
          <p className="text-muted">South London</p>
        </div>
        <div className="text-right">
          <a href={`mailto:${site.email}`} className="link-underline block">
            {site.email}
          </a>
          <a href={site.phoneHref} className="link-underline block">
            {site.phone}
          </a>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline block"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
