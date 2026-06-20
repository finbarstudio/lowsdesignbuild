"use client";

/* eslint-disable @next/next/no-img-element */

type Post = { img: string; url: string };

/**
 * A continuous, edge-to-edge marquee of Instagram posts — square tiles that
 * scroll sideways and pause on hover, each linking to the real post. Photos sit
 * in grayscale (tying into the family portraits) and bloom into colour on hover.
 * Fully self-contained: no Instagram embed script, just the images + post links.
 */
export default function InstagramStrip({
  posts,
  profileUrl,
}: {
  posts: Post[];
  profileUrl: string;
}) {
  if (posts.length === 0) return null;
  // duplicate the set so the -50% marquee loops seamlessly
  const track = [...posts, ...posts];

  return (
    <div>
      <div className="marquee group overflow-hidden">
        <div className="marquee-track flex w-max gap-4 pr-4">
          {track.map((p, i) => (
            <a
              key={i}
              href={p.url || profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on Instagram"
              className="group/tile relative block aspect-square w-56 shrink-0 overflow-hidden bg-line sm:w-64"
            >
              <img
                src={p.img}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover/tile:scale-105 group-hover/tile:grayscale-0"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover/tile:opacity-100" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
