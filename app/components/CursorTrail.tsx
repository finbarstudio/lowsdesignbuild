"use client";

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

type Trail = { id: number; x: number; y: number; src: string; rot: number };

/**
 * Wraps any content and, as the cursor moves across it, spawns a trail of the
 * given images along the cursor's path — each pops in, then fades and scales
 * away. (After motion.dev's "cursor trail" example.) Desktop only — there's no
 * cursor to trail on touch. Images are preloaded on mount so the first hover
 * never flashes blank.
 */
export default function CursorTrail({
  images,
  children,
  className = "",
  step = 70,
  life = 700,
  width = 176,
}: {
  images: string[];
  children: React.ReactNode;
  className?: string;
  /** pixels of cursor travel between spawns */
  step?: number;
  /** ms each trail image lives */
  life?: number;
  /** trail image width in px */
  width?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<Trail[]>([]);
  const last = useRef({ x: 0, y: 0, set: false });
  const idRef = useRef(0);
  const imgRef = useRef(0);

  function spawn(x: number, y: number) {
    if (images.length === 0) return;
    const src = images[imgRef.current % images.length];
    imgRef.current += 1;
    const id = idRef.current++;
    const rot = ((id % 7) - 3) * 2.5; // deterministic -7.5°..+7.5°
    setTrail((t) => [...t.slice(-14), { id, x, y, src, rot }]);
    window.setTimeout(() => {
      setTrail((t) => t.filter((item) => item.id !== id));
    }, life);
  }

  function handleMove(e: React.MouseEvent) {
    if (images.length === 0) return;
    const b = wrapRef.current?.getBoundingClientRect();
    if (!b) return;
    const x = e.clientX - b.left;
    const y = e.clientY - b.top;
    if (!last.current.set) {
      last.current = { x, y, set: true };
      spawn(x, y);
      return;
    }
    const dx = x - last.current.x;
    const dy = y - last.current.y;
    if (Math.hypot(dx, dy) >= step) {
      last.current = { x, y, set: true };
      spawn(x, y);
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        last.current.set = false;
      }}
    >
      {/* preload every trail image on mount (rendered, but clipped + invisible)
          so the cursor never picks one that hasn't loaded yet */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
      >
        {images.map((src) => (
          <img key={src} src={src} alt="" decoding="async" />
        ))}
      </div>

      {/* trail layer — sits above the content; desktop only */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
        <AnimatePresence>
          {trail.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1, rotate: t.rot }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute overflow-hidden bg-line shadow-2xl ring-1 ring-black/5"
              style={{ left: t.x, top: t.y, width, x: "-50%", y: "-50%" }}
            >
              <img src={t.src} alt="" className="block h-auto w-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {children}
    </div>
  );
}
