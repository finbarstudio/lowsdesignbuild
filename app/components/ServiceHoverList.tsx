"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, useState } from "react";

type Service = { title: string; blurb: string; imgs: string[] };

/**
 * The services as a vertical list of names. Hovering a name reveals its image,
 * which follows the cursor — position smoothed with a spring, and skewed in the
 * direction of travel by linking skewX/skewY to the cursor velocity.
 * (After motion.dev's "cursor: image hover" example.)
 */
export default function ServiceHoverList({
  services,
}: {
  services: Service[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // raw cursor position within the list
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // smoothed follow
  const spring = { damping: 28, stiffness: 220, mass: 0.6 };
  const x = useSpring(mouseX, spring);
  const y = useSpring(mouseY, spring);

  // velocity → skew (smoothed), so the image leans into the direction of travel
  const xVelocity = useVelocity(x);
  const yVelocity = useVelocity(y);
  const xVelSmooth = useSpring(xVelocity, { damping: 40, stiffness: 300 });
  const yVelSmooth = useSpring(yVelocity, { damping: 40, stiffness: 300 });
  const skewX = useTransform(xVelSmooth, [-2000, 2000], [-18, 18], {
    clamp: true,
  });
  const skewY = useTransform(yVelSmooth, [-2000, 2000], [-8, 8], {
    clamp: true,
  });

  function handleMove(e: React.MouseEvent) {
    const b = wrapRef.current?.getBoundingClientRect();
    if (!b) return;
    mouseX.set(e.clientX - b.left);
    mouseY.set(e.clientY - b.top);
  }

  const activeImg =
    active !== null ? services[active]?.imgs?.[0] : undefined;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
    >
      {/* floating preview that follows the cursor */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-20 hidden w-64 lg:block"
        style={{
          x,
          y,
          skewX,
          skewY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <AnimatePresence mode="popLayout">
          {activeImg && (
            <motion.div
              key={activeImg}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden bg-line shadow-2xl ring-1 ring-black/5"
            >
              <Image
                src={activeImg}
                alt=""
                width={800}
                height={1000}
                sizes="256px"
                className="block h-auto w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
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
                style={{
                  opacity: active === null || active === i ? 1 : 0.35,
                }}
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
