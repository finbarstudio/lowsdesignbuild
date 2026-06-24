"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

type Shot = { hi: string; lo: string };
type Service = { title: string; blurb: string; imgs: Shot[] };

/**
 * "What we do" as an always-visible 3-column grid. Each card shows a main image;
 * on hover it scrolls through that service's other photos in place (crossfade),
 * the same idea as the old cursor slideshow but anchored in the card. A fixed
 * card aspect + object-cover keeps the grid tidy across mixed source ratios.
 */
function ServiceCard({ s }: { s: Service }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

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
    <div className="group/s" onMouseEnter={start} onMouseLeave={stop}>
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        {s.imgs.length > 0 ? (
          s.imgs.map((img, i) => (
            <img
              key={i}
              src={img.hi}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover grayscale transition-opacity duration-500 ease-out group-hover/s:grayscale-0 ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-line" />
        )}
        {/* count of extra photos — a subtle gold hint that it animates */}
        {s.imgs.length > 1 ? (
          <span className="absolute right-3 top-3 font-mono text-[0.65rem] text-white/80">
            {String(idx + 1).padStart(2, "0")}/
            {String(s.imgs.length).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
        {s.title}
      </h3>
      {s.blurb ? (
        <p className="mt-1 text-sm leading-relaxed text-muted">{s.blurb}</p>
      ) : null}
    </div>
  );
}

export default function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <ServiceCard key={s.title} s={s} />
      ))}
    </div>
  );
}
