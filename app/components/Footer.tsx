"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { areas, nav, site } from "@/app/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;

  return (
    <footer className="">
      <div className="mx-auto w-full max-w-[1900px] px-4 py-20 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="serif text-2xl">{site.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {site.tagline}.
            </p>
          </div>

          <div>
            <p className="label">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label">Areas</p>
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted">
              {areas.slice(0, 8).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={site.phoneHref} className="link-underline">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="link-underline">
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>Family-run design &amp; build · South London</p>
        </div>
      </div>
    </footer>
  );
}
