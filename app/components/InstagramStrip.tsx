/* eslint-disable @next/next/no-img-element */

type Post = { img: string; url: string };

/**
 * Instagram grid — 6 columns × 2 rows, 5px gaps, padded from the edges.
 * Shows at most 12 posts (the first two rows of a 6-up grid). Photos sit in
 * grayscale on desktop and bloom to full colour on hover.
 */
export default function InstagramStrip({
  posts,
  profileUrl,
}: {
  posts: Post[];
  profileUrl: string;
}) {
  if (posts.length === 0) return null;

  const tiles = posts.slice(0, 12);

  return (
    <div className="px-4 sm:px-6">
      {/* mobile: a 2×2 grid (first four posts); desktop: the full 6-up rows */}
      <div
        className="grid grid-cols-2 sm:grid-cols-6"
        style={{ gap: "5px" }}
      >
        {tiles.map((p, i) => (
          <a
            key={i}
            href={p.url || profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on Instagram"
            className={`group/tile relative block aspect-square overflow-hidden bg-line ${
              i >= 4 ? "max-sm:hidden" : ""
            }`}
          >
            <img
              src={p.img}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-700 ease-out lg:grayscale lg:group-hover/tile:scale-105 lg:group-hover/tile:grayscale-0"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
