"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

type Shot = { hi: string; lo: string };
type Service = { title: string; blurb: string; imgs: Shot[] };

const CYCLE = 2400; // ms each photo holds
const FADE = "1400ms"; // crossfade duration — long + soft

/**
 * "What we do" — an aligned 4:3 grid. Photos sit in greyscale and bloom to
 * colour as they scroll in. On desktop, hovering cross-fades slowly through a
 * service's other photos (with a "Slideshow" cursor); on touch, where there's
 * no hover, the photos auto-rotate once the card is in view.
 */
function ServiceCard({ s }: { s: Service }) {
  const ref = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const touch = useRef(false);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    touch.current = window.matchMedia("(hover: none)").matches;
    return () => window.clearInterval(timer.current);
  }, []);

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

  function onMove(e: React.MouseEvent) {
    if (cursorRef.current) {
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    }
  }

  return (
    <>
      <div
        ref={ref}
        className="group/s sm:cursor-none"
        onMouseEnter={() => {
          if (touch.current) return;
          setShowCursor(true);
          cycle();
        }}
        onMouseMove={onMove}
        onMouseLeave={() => {
          if (touch.current) return;
          setShowCursor(false);
          window.clearInterval(timer.current);
          setIdx(0);
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          {s.imgs.length > 0 ? (
            s.imgs.map((img, i) => (
              <img
                key={i}
                src={img.hi}
                alt=""
                loading="lazy"
                style={{ transitionDuration: FADE }}
                className={`absolute inset-0 h-full w-full object-cover transition-[opacity,filter] ease-[cubic-bezier(0.4,0,0.2,1)] ${
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

      {/* "Slideshow" cursor (desktop, when more than one photo) */}
      {s.imgs.length > 1 ? (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className="pointer-events-none fixed z-[60] hidden -translate-x-1/2 -translate-y-1/2 sm:block"
          style={{ opacity: showCursor ? 1 : 0, transition: "opacity 0.2s ease" }}
        >
          <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-foreground text-center font-mono text-[0.6rem] font-medium uppercase leading-[1.3] tracking-[0.14em] text-background">
            Slideshow
          </span>
        </div>
      ) : null}
    </>
  );
}

export default function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
      {services.map((s) => (
        <ServiceCard key={s.title} s={s} />
      ))}
    </div>
  );
}
