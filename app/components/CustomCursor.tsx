"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One global custom cursor. It always tracks the pointer (a smooth rAF lerp, so
 * it never snaps or "fights" the mouse), and grows into a labelled badge while
 * hovering anything that opts in with a `data-cursor="…"` attribute. Pointer
 * devices only. Because position is continuous and only the scale toggles, entry
 * and exit are smooth — no jump on the first move.
 */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const scale = useRef(0);
  const wanted = useRef(0); // target scale (1 when over a cursor element)
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    pos.current = { ...target.current };

    let raf = 0;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.2;
      pos.current.y += (target.current.y - pos.current.y) * 0.2;
      scale.current += (wanted.current - scale.current) * 0.18;
      const el = ref.current;
      if (el) {
        el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${scale.current.toFixed(3)})`;
        el.style.opacity = `${Math.min(1, scale.current * 1.4).toFixed(3)}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      const hit = (e.target as Element | null)?.closest?.("[data-cursor]");
      const next = hit?.getAttribute("data-cursor") ?? "";
      wanted.current = next ? 1 : 0;
      if (next && next !== label) setLabel(next);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [label]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] opacity-0 will-change-transform"
    >
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-foreground px-2 text-center font-mono text-[0.6rem] font-medium uppercase leading-[1.35] tracking-[0.14em] text-background">
        {label}
      </span>
    </div>
  );
}
