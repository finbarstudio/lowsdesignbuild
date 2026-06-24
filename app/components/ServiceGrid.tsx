"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

type Shot = { hi: string; lo: string };
type Service = { title: string; blurb: string; imgs: Shot[] };

const CYCLE = 1500; // ms each photo holds (faster)
const FADE = "900ms"; // crossfade — smooth
const EASE = "cubic-bezier(0.4,0,0.2,1)";

/**
 * "What we do" — an aligned 4:3 grid. Each card mask-reveals (image rises, text
 * lifts) when it scrolls in, staggered across the row. Photos sit in greyscale
 * and bloom to colour. On desktop, hovering cross-fades through the service's
 * other photos with a "Slideshow" cursor; on touch they auto-rotate in view.
 */
function ServiceCard({ s, index }: { s: Service; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const touch = useRef(false);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);

  const delay = (index % 3) * 110;

  useEffect(() => {
    touch.current = window.matchMedia("(hover: none)").matches;
    return () => window.clearInterval(timer.current);
  }, []);

  // reveal + greyscale→colour once the card scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let raf = 0;
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
        setShown(true);
        cleanup();
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cleanup();
      cancelAnimationFrame(raf);
    };
  }, []);

  function cycle() {
    if (s.imgs.length <= 1) return;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(
      () => setIdx((i) => (i + 1) % s.imgs.length),
      CYCLE,
    );
  }

  // touch: auto-rotate once in view (no hover to trigger it)
  useEffect(() => {
    if (shown && touch.current) cycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  return (
    <div ref={ref}>
      {/* image — mask-reveals (rises) on scroll-in; cycles photos on hover */}
      <div
        data-cursor="Slideshow"
        className="relative aspect-[4/3] overflow-hidden bg-line sm:cursor-none"
        onMouseEnter={() => {
          if (!touch.current) cycle();
        }}
        onMouseLeave={() => {
          if (touch.current) return;
          window.clearInterval(timer.current);
          setIdx(0);
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: shown ? "translateY(0)" : "translateY(101%)",
            transition: `transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
          }}
        >
          {s.imgs.length > 0 ? (
            s.imgs.map((img, i) => (
              <img
                key={i}
                src={img.hi}
                alt=""
                loading="lazy"
                style={{ transitionDuration: FADE, transitionTimingFunction: EASE }}
                className={`absolute inset-0 h-full w-full object-cover transition-[opacity,filter] ${
                  shown ? "grayscale-0" : "grayscale"
                } ${i === idx ? "opacity-100" : "opacity-0"}`}
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-line" />
          )}
        </div>
      </div>

      {/* title + blurb lift in after the image */}
      <div
        style={{
          transform: shown ? "translateY(0)" : "translateY(14px)",
          opacity: shown ? 1 : 0,
          transition: `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay + 140}ms, opacity 0.7s ease ${delay + 140}ms`,
        }}
      >
        <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
          {s.title}
        </h3>
        {s.blurb ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.blurb}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
      {services.map((s, i) => (
        <ServiceCard key={s.title} s={s} index={i} />
      ))}
    </div>
  );
}
