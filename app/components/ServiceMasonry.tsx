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

// Reveal each tile as IT scrolls into view (same as the team images), so they
// come in one at a time (left→right, top→bottom) rather than a whole grid at
// once. IntersectionObserver; reduced motion is handled in the CSS below.
function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Desktop reveals a touch earlier in the scroll than mobile.
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      {
        threshold: mobile ? 0.25 : 0.15,
        rootMargin: mobile ? "0px 0px -22% 0px" : "0px 0px -8% 0px",
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

function Tile({ s, delay }: { s: Service; delay: number }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="group relative aspect-[40/33] overflow-hidden bg-background"
    >
      {/* the WHOLE tile (photo + gradient + title) mask-rises up together over
          paper, so there's never a visible empty box/frame first. */}
      <div
        className={`sm-rise absolute inset-0 ${inView ? "is-in" : ""}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <img
          src={s.img}
          alt={s.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* dark gradient along the bottom for the title */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="text-base font-semibold uppercase leading-tight tracking-[0.08em] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-lg sm:group-hover:-translate-y-1">
            {s.title}
          </h3>
          {/* description: shown by default on mobile (no hover on touch); on
              desktop it masks up from below on hover (0fr → 1fr). */}
          <div className="mt-2 grid grid-rows-[1fr] opacity-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:mt-0 sm:grid-rows-[0fr] sm:opacity-0 sm:group-hover:mt-2 sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100">
            <p className="overflow-hidden text-xs leading-relaxed text-white/85 sm:text-sm">
              {s.blurb}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * "What we do" — a clean 3-column grid (~70vw, centred), square-cornered tiles.
 * Each photo mask-rises into its tile as the tile scrolls in, one at a time
 * across each row (left→right, top→bottom). Over the photo: a dark gradient with
 * the title (all caps); on hover the title lifts and the description reveals.
 */
export default function ServiceMasonry({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:mx-auto sm:w-[70vw] sm:grid-cols-3">
      <style>{`
        .sm-rise{ transform: translateY(101%); transition: transform .85s cubic-bezier(.22,1,.36,1); will-change: transform; }
        .sm-rise.is-in{ transform: none; }
        @media (prefers-reduced-motion: reduce){ .sm-rise{ transform: none; transition: none; } }
      `}</style>
      {services.map((s, i) => (
        // small L→R stagger within a row (3 up on desktop, 2 on mobile)
        <Tile key={`${s.title}-${i}`} s={s} delay={(i % 3) * 110} />
      ))}
    </div>
  );
}
