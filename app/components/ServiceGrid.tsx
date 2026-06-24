"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

type Shot = { hi: string; lo: string };
type Service = { title: string; blurb: string; imgs: Shot[] };

/**
 * "What we do" as an always-visible grid. Images are shown in full (object-
 * contain, so neither landscape nor portrait gets cropped) on a soft frame.
 * They sit in greyscale and bloom to colour as they scroll into view; on hover
 * the card scrolls through that service's other photos in place.
 */
function ServiceCard({ s }: { s: Service }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

  // greyscale → colour once the card scrolls into view
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
      if (r.top < window.innerHeight * 0.82 && r.bottom > 0) {
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

  function start() {
    if (s.imgs.length <= 1) return;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(
      () => setIdx((i) => (i + 1) % s.imgs.length),
      850,
    );
  }
  function stop() {
    window.clearInterval(timer.current);
    setIdx(0);
  }

  return (
    <div ref={ref} className="group/s" onMouseEnter={start} onMouseLeave={stop}>
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        {s.imgs.length > 0 ? (
          s.imgs.map((img, i) => (
            <img
              key={i}
              src={img.hi}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-contain transition-[opacity,filter] duration-700 ease-out ${
                shown ? "grayscale-0" : "grayscale"
              } ${i === idx ? "opacity-100" : "opacity-0"}`}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-line" />
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
        {s.title}
      </h3>
      {s.blurb ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.blurb}</p>
      ) : null}
    </div>
  );
}

export default function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
      {services.map((s) => (
        <ServiceCard key={s.title} s={s} />
      ))}
    </div>
  );
}
