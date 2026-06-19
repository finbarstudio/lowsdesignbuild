"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Service = { title: string; blurb: string; imgs: string[] };

/**
 * Services as a vertical list of names. Hovering a name reveals a preview that
 * follows the cursor and runs a slideshow of that service's photos — each new
 * photo wipes in over the last (the .wipe-in token). Photos keep their native
 * aspect ratio (no crop); cycling photos are centred on the settled one.
 */
export default function ServiceSlideshow({
  services,
}: {
  services: Service[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [step, setStep] = useState(0);

  // cursor position → spring-smoothed follow
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { damping: 30, stiffness: 250, mass: 0.5 });
  const y = useSpring(my, { damping: 30, stiffness: 250, mass: 0.5 });

  // cycle the active service's photos
  useEffect(() => {
    setStep(0);
    if (active === null) return;
    const imgs = services[active]?.imgs ?? [];
    if (imgs.length < 2) return;
    const id = setInterval(() => setStep((s) => s + 1), 1400);
    return () => clearInterval(id);
  }, [active, services]);

  function handleMove(e: React.MouseEvent) {
    const b = wrapRef.current?.getBoundingClientRect();
    if (!b) return;
    mx.set(e.clientX - b.left);
    my.set(e.clientY - b.top);
  }

  const svc = active !== null ? services[active] : null;
  const imgs = svc?.imgs ?? [];
  const cur = imgs.length ? step % imgs.length : 0;
  const prev = imgs.length ? (step - 1 + imgs.length) % imgs.length : 0;
  const baseIdx = step > 0 ? prev : 0;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
    >
      {/* cursor-following preview — desktop only (no cursor on touch) */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-20 hidden w-72 lg:block"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      >
        {svc && imgs.length > 0 && (
          <div className="relative">
            {/* settled photo — defines the box, keeps native aspect */}
            <div className="bg-line shadow-2xl ring-1 ring-black/5">
              <Image
                key={`base-${baseIdx}`}
                src={imgs[baseIdx]}
                alt=""
                width={800}
                height={1000}
                sizes="288px"
                className="block h-auto w-full"
              />
            </div>
            {/* next photo wiping in, centred on the box centre, native aspect */}
            {step > 0 && (
              <div
                key={step}
                className="wipe-in absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 shadow-2xl ring-1 ring-black/5"
              >
                <Image
                  src={imgs[cur]}
                  alt=""
                  width={800}
                  height={1000}
                  sizes="288px"
                  className="block h-auto w-full"
                />
              </div>
            )}
          </div>
        )}
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
