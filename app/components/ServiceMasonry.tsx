"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

type Service = {
  title: string;
  blurb: string;
  img: string;
  lqip?: string;
  aspect?: number;
};

// Reveal the grid once it scrolls into view (so the tiles can rise, staggered).
function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * "What we do" — a clean 3-column grid (~70vw, centred), square-cornered tiles.
 * Each photo mask-RISES into its tile (same reveal as the team images), staggered
 * across the grid as it scrolls in. Over the photo: a dark gradient with the title
 * (all caps); on hover the title lifts and the description reveals up from a mask
 * below, while the image gently zooms. Reduced motion shows the photos at rest.
 */
export default function ServiceMasonry({ services }: { services: Service[] }) {
  const [gridRef, inView] = useInView();

  return (
    <div
      ref={gridRef}
      className="mx-auto grid w-[88vw] grid-cols-2 gap-3 sm:w-[70vw] sm:grid-cols-3"
    >
      <style>{`
        .sm-rise{ transform: translateY(101%); transition: transform .9s cubic-bezier(.22,1,.36,1); will-change: transform; }
        .sm-rise.is-in{ transform: none; }
        @media (prefers-reduced-motion: reduce){ .sm-rise{ transform: none; transition: none; } }
      `}</style>
      {services.map((s, i) => (
        <div
          key={`${s.title}-${i}`}
          className="group relative aspect-[40/33] overflow-hidden bg-[var(--line)]"
        >
          {/* mask-rise wrapper: the photo lifts up out of the tile on reveal,
              staggered by index; the inner img keeps the hover zoom. */}
          <div
            className={`sm-rise absolute inset-0 ${inView ? "is-in" : ""}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <img
              src={s.img}
              alt={s.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            />
          </div>
          {/* dark gradient along the bottom for the title */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="text-sm font-semibold uppercase leading-tight tracking-[0.08em] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 sm:text-lg">
              {s.title}
            </h3>
            {/* description masks up from below on hover (0fr → 1fr) */}
            <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100 motion-reduce:transition-none">
              <p className="overflow-hidden text-xs leading-relaxed text-white/85 sm:text-sm">
                {s.blurb}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
