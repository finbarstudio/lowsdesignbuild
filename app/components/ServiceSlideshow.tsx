"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Shot = { hi: string; lo: string };
type Service = { title: string; blurb: string; imgs: Shot[] };
type Card = { id: number; shot: Shot };

// longest edge cap (px): a portrait's height == a landscape's width, so every
// photo fits inside the same square/circle regardless of orientation
const SIZE = 448;
const TICK = 1100; // ms between each new stacked photo
const DEPTH = 6; // how many photos are kept in the stack (older ones drop off)

/**
 * Services as a vertical list of names. Hovering a name reveals a preview that
 * follows the cursor and *stacks* that service's photos — each new photo lands
 * sharp on top, and the ones behind it transition to blur (and drop to a low-res
 * source to save memory) before fading out. Photos are normalised so the longest
 * edge is equal, keeping wide and tall shots visually the same size.
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

  // cursor position → spring-smoothed follow
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
      {/* preload every photo (rendered, clipped + invisible) so the stack never
          blurs before its replacement has loaded */}
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
              setPortrait((p) =>
                src in p ? p : { ...p, [src]: h > w },
              );
            }}
          />
        ))}
      </div>
      {/* cursor-following stack — desktop only (no cursor on touch) */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      >
        {stack.map((card, i) => {
          const depth = stack.length - 1 - i; // 0 = newest, on top and sharp
          const top = depth === 0;
          // portraits read 30% smaller, landscapes 10% smaller, so heights even out
          const cap = SIZE * (portrait[card.shot.hi] ? 0.7 : 0.9);
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
      </motion.div>

      {/* the list of names */}
      <ul className="relative z-10">
        {services.map((s, i) => (
          <li
            key={s.title}
            onMouseEnter={() => setActive(i)}
            className="border-t border-line last:border-b"
          >
            <div className="flex items-baseline justify-between gap-6 py-6 sm:py-8">
              <h3
                className="text-2xl font-semibold tracking-tight transition-opacity duration-300 sm:text-4xl"
                style={{ opacity: active === null || active === i ? 1 : 0.35 }}
              >
                {s.title}
              </h3>
              <p className="hidden max-w-xs text-sm leading-relaxed text-muted sm:block">
                {s.blurb}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
