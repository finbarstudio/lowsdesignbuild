"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * "Get an instant quote" CTA — the Spotlight design from the button studio.
 *
 * A grained paper pill where a warm gold radial spotlight tracks the cursor,
 * softly lighting the label and revealing a masked project photo underneath; on
 * leave it eases back to centre. Needs pointer JS, so it's a client component.
 * `photo` is a live project hero image (from Sanity); the fan and this button
 * both track the CMS. Hover is gated to fine pointers in CSS, and it degrades to
 * a plain paper pill (centred spotlight) without JS.
 */
export default function InstantQuoteButton({
  photo,
  className = "",
}: {
  photo?: string;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let raf = 0;
    let tx = 50;
    let ty = 50;
    const apply = () => {
      root.style.setProperty("--spotlight-x", `${tx}%`);
      root.style.setProperty("--spotlight-y", `${ty}%`);
      raf = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      schedule();
    };
    const enter = () => root.style.setProperty("--spotlight-on", "1");
    const leave = () => {
      root.style.setProperty("--spotlight-on", "0");
      tx = 50;
      ty = 50;
      schedule();
    };
    const onFocus = () => {
      enter();
      tx = 50;
      ty = 50;
      apply();
    };
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("focus", onFocus);
    root.addEventListener("blur", leave);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focus", onFocus);
      root.removeEventListener("blur", leave);
    };
  }, []);

  return (
    <>
      <style>{css}</style>
      <Link
        ref={ref}
        href="/estimate"
        className={`btn-spotlight ${className}`}
        aria-label="Get an instant quote"
      >
        <span
          className="btn-spotlight__img"
          aria-hidden="true"
          style={photo ? { backgroundImage: `url("${photo}")` } : undefined}
        />
        <span className="btn-spotlight__grain" aria-hidden="true" />
        <span className="btn-spotlight__glow" aria-hidden="true" />
        <span className="btn-spotlight__sheen" aria-hidden="true" />
        <span className="btn-spotlight__label">Get an instant quote</span>
      </Link>
    </>
  );
}

const css = `
.btn-spotlight{--spotlight-x:50%;--spotlight-y:50%;--spotlight-on:0;position:relative;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;isolation:isolate;box-sizing:border-box;padding:1.15rem 2.4rem;border-radius:999px;text-decoration:none;background:var(--background);border:1px solid var(--line);overflow:hidden;-webkit-tap-highlight-color:transparent;transition:border-color .55s cubic-bezier(.22,.61,.36,1),box-shadow .55s cubic-bezier(.22,.61,.36,1),transform .55s cubic-bezier(.22,.61,.36,1);box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 1px 2px rgba(66,73,82,.05)}
.btn-spotlight__img{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center 62%;opacity:calc(.20 * var(--spotlight-on));filter:saturate(.72) contrast(1.02);-webkit-mask-image:radial-gradient(circle 118px at var(--spotlight-x) var(--spotlight-y),#000 0%,rgba(0,0,0,.55) 34%,transparent 66%);mask-image:radial-gradient(circle 118px at var(--spotlight-x) var(--spotlight-y),#000 0%,rgba(0,0,0,.55) 34%,transparent 66%);transition:opacity .6s cubic-bezier(.22,.61,.36,1)}
.btn-spotlight__grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.5;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/></svg>")}
.btn-spotlight__glow{position:absolute;inset:-1px;z-index:2;pointer-events:none;background:radial-gradient(circle 130px at var(--spotlight-x) var(--spotlight-y),rgba(169,126,31,.30),rgba(169,126,31,.14) 30%,rgba(169,126,31,0) 62%);opacity:calc(.35 + .65 * var(--spotlight-on));transition:opacity .6s cubic-bezier(.22,.61,.36,1)}
.btn-spotlight__sheen{position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,0) 42%);opacity:.7}
.btn-spotlight__label{position:relative;z-index:4;font-family:var(--font-mono-stack);font-size:.7rem;line-height:1;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;color:var(--ink);transition:color .55s cubic-bezier(.22,.61,.36,1)}
.btn-spotlight__label::after{content:"";position:absolute;left:0;right:100%;bottom:-.45em;height:1px;background:var(--tertiary);opacity:.75;transition:right .5s cubic-bezier(.22,.61,.36,1)}
.btn-spotlight:hover{border-color:rgba(169,126,31,.5);box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 8px 24px -12px rgba(133,97,21,.4),0 2px 6px rgba(66,73,82,.06);transform:translateY(-1px)}
.btn-spotlight:hover .btn-spotlight__label{color:var(--copper-deep)}
.btn-spotlight:hover .btn-spotlight__label::after{right:0}
.btn-spotlight:active{transform:translateY(0)}
.btn-spotlight:focus-visible{outline:none;border-color:var(--tertiary);box-shadow:0 0 0 2px var(--background),0 0 0 4px rgba(169,126,31,.6)}
@media (hover:none){.btn-spotlight__label::after{right:0}}
@media (prefers-reduced-motion:reduce){.btn-spotlight,.btn-spotlight__label,.btn-spotlight__label::after,.btn-spotlight__img,.btn-spotlight__glow{transition:none}.btn-spotlight:hover{transform:none}}
`;
