import Image from "next/image";
import Link from "next/link";

import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/lib/types";

/**
 * A featured-project card. Clean image with the title/tags revealing on hover.
 * Over the card the global custom cursor becomes a "View project" badge
 * (data-cursor), and the native cursor is hidden.
 */
export default function FeaturedCard({
  p,
  first = false,
}: {
  p: ProjectListItem;
  first?: boolean;
}) {
  const tags = [p.category, p.location, p.year].filter(Boolean).map(String);
  const src = p.mainImage
    ? urlFor(p.mainImage).width(1600).height(900).fit("crop").url()
    : "";
  const alt = [p.title, p.category, p.location].filter(Boolean).join(", ");

  return (
    <Link
      href={`/projects/${p.slug}`}
      data-cursor="View project"
      data-featured-first={first ? "" : undefined}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-line transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:z-10 hover:scale-[1.02] active:scale-[0.99] active:duration-100 sm:cursor-none"
    >
      {p.mainImage && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="80vw"
          placeholder={p.lqip ? "blur" : undefined}
          blurDataURL={p.lqip ?? undefined}
          className="object-cover"
        />
      )}

      {/* soft black gradient + title/tags reveal on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:gap-3 sm:p-8">
        <span className="block overflow-hidden">
          <h3 className="translate-y-full text-2xl font-bold uppercase leading-[1.05] tracking-tight text-white transition-transform duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 sm:text-3xl lg:text-4xl">
            {p.title}
          </h3>
        </span>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t2, i) => (
              <span key={t2} className="block overflow-hidden">
                <span
                  className="pill translate-y-[140%] text-[0.62rem] text-white backdrop-blur-sm transition-transform duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)] [border-width:1px] group-hover:translate-y-0"
                  style={{ transitionDelay: `${120 + i * 90}ms` }}
                >
                  {t2}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
