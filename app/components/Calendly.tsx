"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CAL_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CAL_JS = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyApi = {
  initPopupWidget: (o: { url: string }) => void;
  initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void;
};

const getCalendly = () =>
  (window as unknown as { Calendly?: CalendlyApi }).Calendly;

// Brand the scheduler to the site palette (paper / gold / slate) and strip the
// chrome we already provide ourselves: the event-details header (our card copy
// says 30 min / video call), the landing-page details and the GDPR banner.
const themed = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=f4f1ea&primary_color=a97e1f&text_color=424952`;

/**
 * "Book a call" — opens the Calendly scheduler in OUR own overlay, styled like
 * the project gallery lightbox (same dark backdrop, same bare ✕): click the
 * greyed-out area (pointer cursor) or press Escape to close. Falls back to
 * opening the link in a new tab if the widget script hasn't loaded. The URL is
 * set in Sanity (Contact → Calendly booking link).
 */
export function CalendlyPopupButton({
  url,
  className = "",
  children,
}: {
  url: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (getCalendly()) {
        e.preventDefault();
        setOpen(true);
      }
      // else: let the <a href> follow through to a new tab (fallback)
    },
    [],
  );

  // Init the inline widget inside the modal panel once it's open.
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    const cal = getCalendly();
    if (el && cal) {
      el.innerHTML = "";
      cal.initInlineWidget({ url: themed(url), parentElement: el });
    }
  }, [open, url]);

  // Escape closes; scroll locked while open (same behaviour as the gallery).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const lenis = (
      window as unknown as { __lenis?: { stop(): void; start(): void } }
    ).__lenis;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const modal = open ? (
    <div
      className="calb"
      role="dialog"
      aria-modal="true"
      aria-label="Book a call"
      onClick={() => setOpen(false)}
    >
      <button
        type="button"
        className="calb__close"
        onClick={() => setOpen(false)}
        aria-label="Close"
      >
        ✕
      </button>
      <div className="calb__panel" onClick={(e) => e.stopPropagation()}>
        <span aria-hidden="true" className="calb__loading">
          Loading calendar…
        </span>
        <div ref={panelRef} className="calb__embed" />
      </div>
      <style>{calbCss}</style>
    </div>
  ) : null;

  return (
    <>
      <link rel="stylesheet" href={CAL_CSS} />
      <Script src={CAL_JS} strategy="lazyOnload" />
      <a
        href={url}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

// Styled to match the project gallery lightbox (.lb) exactly — same backdrop,
// same fade, same bare ✕ — so the two full-screen overlays read as one system.
const calbCss = `
.calb{
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 3vmin;
  background: rgba(18,18,16,0.96);
  animation: calb-fade .28s ease both;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@keyframes calb-fade{ from{ opacity:0 } to{ opacity:1 } }
.calb__panel{
  position: relative;
  width: min(960px, 94vw);
  height: min(700px, 88vh);
  cursor: default;
  background: #f4f1ea;
  border-radius: 2px;
  overflow: hidden;
  animation: calb-pop .3s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes calb-pop{ from{ opacity:0 } to{ opacity:1 } }
.calb__loading{
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  font-family: var(--font-mono-stack, monospace);
  font-size: 12px; text-transform: uppercase; letter-spacing: .18em;
  color: var(--muted, #737373);
}
.calb__embed{ position: relative; height: 100%; width: 100%; }
.calb__embed .calendly-inline-widget{ height: 100% !important; }
.calb__embed .calendly-spinner{ display: none !important; }
.calb__close{
  position: absolute; z-index: 2;
  top: 2.4vh; right: 3.5vw; font-size: 26px;
  color: #fff; background: none; border: none; cursor: pointer;
  line-height: 1; padding: 6px;
  font-family: var(--font-sans-stack, sans-serif);
  text-shadow: 0 1px 10px rgba(0,0,0,.55);
  transition: color .2s ease;
}
.calb__close:hover{ color: var(--tertiary); }
@media (prefers-reduced-motion: reduce){
  .calb, .calb__panel{ animation: none; }
}
`;

/**
 * A static mock of the Calendly scheduler — shown wherever a real booking link
 * hasn't been set in Sanity yet, so the booking section can still be designed and
 * laid out. Swaps automatically for the real embed once the URL is set.
 */
export function CalendlyMock() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // pad to a month grid
  const open = new Set([4, 5, 11, 12, 18, 19, 25, 26]); // "available" days
  return (
    // Sits INSIDE the page's FORM_CARD (which carries the "Or book a call"
    // label), so it has no border of its own — no double frame.
    <div className="grid gap-0 bg-background md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* left: meeting info */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-7">
        <ul className="mt-1 space-y-2 text-sm text-muted">
          <li>◷ 30 min</li>
          <li>▢ Video call / phone</li>
          <li>◍ We&apos;ll talk through your project and next steps.</li>
        </ul>
        <p className="mt-auto pt-6 font-mono text-[11px] leading-relaxed text-muted/70">
          Mock preview — set your Calendly link in Sanity (Contact → Calendly
          booking link) to go live.
        </p>
      </div>
      {/* right: a month calendar */}
      <div className="pt-6 md:pl-7 md:pt-0">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold">Select a day</span>
          <span className="font-mono text-xs text-muted">‹ &nbsp; month &nbsp; ›</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="pb-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              {d}
            </span>
          ))}
          {days.map((n, i) => {
            const valid = n >= 1 && n <= 30;
            const avail = valid && open.has(n);
            return (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded-full text-sm ${
                  !valid
                    ? "text-transparent"
                    : avail
                      ? "cursor-pointer bg-[var(--tertiary)]/12 font-medium text-copper-deep ring-1 ring-[var(--tertiary)]/40"
                      : "text-muted/50"
                }`}
              >
                {valid ? n : "·"}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * An inline Calendly scheduler embedded in the page. Inits manually (polling for
 * the widget script) so it also works after a client-side navigation, not just a
 * fresh load.
 */
export function CalendlyInline({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let tries = 0;
    let timer = 0;
    const init = () => {
      const cal = getCalendly();
      if (cal) {
        el.innerHTML = "";
        cal.initInlineWidget({ url: themed(url), parentElement: el });
        return;
      }
      if (tries++ < 50) timer = window.setTimeout(init, 100);
    };
    init();
    return () => window.clearTimeout(timer);
  }, [url]);

  return (
    // relative wrapper: Calendly's own .calendly-spinner is position:FIXED, so
    // while the iframe loads it centres on the VIEWPORT — floating over the
    // hero before you've even scrolled to it. We kill it and show our own
    // branded loading line behind the iframe instead (the iframe paints over
    // it once ready).
    <div className="relative w-full overflow-hidden rounded-sm">
      <style>{`
        .cal-embed .calendly-spinner { display: none !important; }
        .cal-embed .calendly-inline-widget { height: 100% !important; }
      `}</style>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.18em] text-muted"
      >
        Loading calendar…
      </span>
      <link rel="stylesheet" href={CAL_CSS} />
      <div
        ref={ref}
        className="cal-embed relative h-full w-full"
        // 630px hugs the calendar view (details header is hidden) — 700 left a
        // band of dead space under the widget
        style={{ minWidth: 320, height: 630 }}
      />
      <Script src={CAL_JS} strategy="lazyOnload" />
    </div>
  );
}
