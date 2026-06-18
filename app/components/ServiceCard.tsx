"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Service = { title: string; blurb: string; imgs: string[] };

/**
 * A service: a small thumbnail next to its copy. On hover a larger preview
 * draws in top→bottom (the .wipe token — no opacity/scale); if the service has
 * several example photos it then cycles through them with the same wipe.
 */
export default function ServiceCard({ service }: { service: Service }) {
  const { title, blurb, imgs } = service;
  const [hover, setHover] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hover) {
      setStep(0);
      return;
    }
    if (imgs.length < 2) return;
    const id = setInterval(() => setStep((s) => s + 1), 1500);
    return () => clearInterval(id);
  }, [hover, imgs.length]);

  if (imgs.length === 0) return null;

  const cur = step % imgs.length;
  const prev = (step - 1 + imgs.length) % imgs.length;
  const baseIdx = step > 0 ? prev : 0;

  return (
    <div className="flex gap-5">
      <div
        className="relative w-28 shrink-0"
        style={{ zIndex: hover ? 20 : undefined }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* small thumbnail */}
        <div className="aspect-[4/5] overflow-hidden bg-line">
          <Image
            src={imgs[0]}
            alt={title}
            width={800}
            height={1000}
            sizes="112px"
            className="h-full w-full object-cover"
          />
        </div>

        {/* larger preview: wipes in on hover, cycles photos while hovered */}
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 z-30 w-56 -translate-x-1/2 -translate-y-1/2 ${
            hover ? "wipe-shown" : "wipe-hidden"
          }`}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-line shadow-2xl ring-1 ring-black/5">
            {/* settled photo underneath */}
            <Image
              key={`base-${baseIdx}`}
              src={imgs[baseIdx]}
              alt=""
              fill
              sizes="224px"
              className="object-cover"
            />
            {/* next photo wiping in over it (only while cycling) */}
            {hover && step > 0 && (
              <div key={step} className="wipe-in absolute inset-0">
                <Image
                  src={imgs[cur]}
                  alt=""
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* title aligned to the top of the image, copy to the bottom */}
      <div className="flex flex-col justify-between py-0.5">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{blurb}</p>
      </div>
    </div>
  );
}
