"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

type Service = { title: string; blurb: string; imgs: string[] };
type Trail = { id: number; x: number; y: number; src: string; rot: number };

// pixels of cursor travel between each spawned trail image
const STEP = 70;
// how long each trail image lives before it's removed (exit anim then unmount)
const LIFE = 700;

/**
 * Services as a vertical list of names. Moving the cursor over a name spawns a
 * trail of that service's images along the cursor's path — each pops in, then
 * fades and scales away. (After motion.dev's "cursor trail" example.)
 */
export default function ServiceTrail({ services }: { services: Service[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [trail, setTrail] = useState<Trail[]>([]);

  const last = useRef({ x: 0, y: 0, set: false });
  const idRef = useRef(0);
  const imgRef = useRef(0);

  function spawn(x: number, y: number, service: Service) {
    const src = service.imgs[imgRef.current % service.imgs.length];
    imgRef.current += 1;
    const id = idRef.current++;
    const rot = ((id % 7) - 3) * 2.5; // deterministic -7.5°..+7.5°
    setTrail((t) => [...t.slice(-14), { id, x, y, src, rot }]);
    window.setTimeout(() => {
      setTrail((t) => t.filter((item) => item.id !== id));
    }, LIFE);
  }

  function handleMove(e: React.MouseEvent) {
    if (active === null) return;
    const service = services[active];
    if (!service?.imgs?.length) return;
    const b = wrapRef.current?.getBoundingClientRect();
    if (!b) return;
    const x = e.clientX - b.left;
    const y = e.clientY - b.top;
    if (!last.current.set) {
      last.current = { x, y, set: true };
      spawn(x, y, service);
      return;
    }
    const dx = x - last.current.x;
    const dy = y - last.current.y;
    if (Math.hypot(dx, dy) >= STEP) {
      last.current = { x, y, set: true };
      spawn(x, y, service);
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setActive(null);
        last.current.set = false;
      }}
    >
      {/* the trail layer — desktop only (no cursor on touch) */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
        <AnimatePresence>
          {trail.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1, rotate: t.rot }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-44 overflow-hidden bg-line shadow-2xl ring-1 ring-black/5"
              style={{ left: t.x, top: t.y, x: "-50%", y: "-50%" }}
            >
              <Image
                src={t.src}
                alt=""
                width={800}
                height={1000}
                sizes="176px"
                className="block h-auto w-full"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
