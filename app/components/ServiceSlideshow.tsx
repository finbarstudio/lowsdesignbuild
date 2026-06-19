"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Shot = { hi: string; lo: string };
type Service = { title: string; blurb: string; imgs: Shot[] };
type Card = { id: number; shot: Shot };

// longest edge cap (px): a portrait's height == a landscape's width, so every
// photo fits inside the same square/circle regardless of orientation
const SIZE = 448; // desktop cursor preview
const MOBILE_SIZE = 200; // inline preview when a service is tapped on mobile
const TICK = 1100; // ms between each new stacked photo
const DEPTH = 6; // how many photos are kept in the stack (older ones drop off)

// The stacked photos: newest sharp on top, older ones recede into blur (and a
// low-res source) before dropping off. Shared by the desktop cursor preview and
// the mobile inline preview.
function StackImages({
  stack,
  portrait,
  size,
}: {
  stack: Card[];
  portrait: Record<string, boolean>;
  size: number;
}) {
  return (
    <>
      {stack.map((card, i) => {
        const depth = stack.length - 1 - i; // 0 = newest, on top and sharp
        const top = depth === 0;
        // portraits read 30% smaller, landscapes 10% smaller, so heights even out
        const cap = size * (portrait[card.shot.hi] ? 0.7 : 0.9);
        return (
          <img
            key={card.id}
            src={top ? card.shot.hi : card.shot.lo}
            alt=""
            className="absolute left-1/2 top-1/2 bg-line shadow-2xl ring-1 ring-black/5 transition-all duration-700 ease-out"
            style={{
              maxWidth: cap,
              maxHeight: cap,
              width: "auto",
              height: "auto",
              transform: `translate(-50%, -50%) scale(${1 - depth * 0.03})`,
              filter: `blur(${depth * 2.5}px)`,
              opacity: Math.max(0, 1 - depth * 0.2),
              zIndex: 100 - depth,
            }}
          />
        );
      })}
    </>
  );
}

/**
 * Services as a vertical list of names.
 * - Desktop: hovering a name reveals a preview that follows the cursor and
 *   *stacks* that service's photos.
 * - Mobile: tapping a name shifts that row to [photo stack | title] and runs
 *   the same scroll-through stack inline. Tap again to close.
 */
export default function ServiceSlideshow({
  services,
}: {
  services: Service[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [stack, setStack] = useState<Card[]>([]);
  // orientation per source (true = portrait), learned at preload
  const [portrait, setPortrait] = useState<Record<string, boolean>>({});
  const idRef = useRef(0);
  const iRef = useRef(0);

  // cursor position → spring-smoothed follow (desktop)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { damping: 30, stiffness: 250, mass: 0.5 });
  const y = useSpring(my, { damping: 30, stiffness: 250, mass: 0.5 });

  // build / refresh the stack for the active service
  useEffect(() => {
    setStack([]);
    iRef.current = 0;
    if (active === null) return;
    const imgs = services[active]?.imgs ?? [];
    if (imgs.length === 0) return;
    const push = () => {
      const shot = imgs[iRef.current % imgs.length];
      iRef.current += 1;
      const id = idRef.current++;
      setStack((s) => [...s.slice(-(DEPTH - 1)), { id, shot }]);
    };
    push();
    if (imgs.length === 1) return; // single photo: show it once, nothing to stack
    const t = setInterval(push, TICK);
    return () => clearInterval(t);
  }, [active, services]);

  function handleMove(e: React.MouseEvent) {
    const b = wrapRef.current?.getBoundingClientRect();
    if (!b) return;
    mx.set(e.clientX - b.left);
    my.set(e.clientY - b.top);
  }

  // every source across all services, preloaded on mount so a photo is ready
  // before it's needed — otherwise the stack can blur with nothing sharp in front
  const preload = Array.from(
    new Set(services.flatMap((s) => s.imgs.flatMap((shot) => [shot.hi, shot.lo]))),
  );

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
    >
      {/* preload every photo (clipped + invisible) so the stack never blurs
          before its replacement has loaded; also learns orientation */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
      >
        {preload.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              setPortrait((p) => (src in p ? p : { ...p, [src]: h > w }));
            }}
          />
        ))}
      </div>

      {/* desktop: cursor-following stack (no cursor on touch) */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      >
        <StackImages stack={stack} portrait={portrait} size={SIZE} />
      </motion.div>

      {/* the list of names */}
      <ul className="relative z-10">
        {services.map((s, i) => {
          const isActive = active === i;
          return (
            <li key={s.title} className="border-t border-line last:border-b">
              {/* ---- mobile (tap to reveal photos; tap again to close) ---- */}
              <button
                type="button"
                onClick={() => setActive(isActive ? null : i)}
                className="block w-full text-left lg:hidden"
              >
                {isActive ? (
                  <div className="flex items-center gap-5 py-6">
                    <div className="relative h-56 w-48 shrink-0">
                      <StackImages stack={stack} portrait={portrait} size={MOBILE_SIZE} />
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {s.title}
                    </h3>
                  </div>
                ) : (
                  <div className="py-6">
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                      {s.blurb}
                    </p>
                  </div>
                )}
              </button>

              {/* ---- desktop (hover) ---- */}
              <div
                onMouseEnter={() => setActive(i)}
                className="hidden items-baseline justify-between gap-6 py-8 lg:flex"
              >
                <h3
                  className="text-4xl font-semibold tracking-tight transition-opacity duration-300"
                  style={{ opacity: active === null || isActive ? 1 : 0.35 }}
                >
                  {s.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted">
                  {s.blurb}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
