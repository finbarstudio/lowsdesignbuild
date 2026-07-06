"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

const CAL_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CAL_JS = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyApi = {
  initPopupWidget: (o: { url: string }) => void;
  initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void;
  closePopupWidget: () => void;
};

const getCalendly = () =>
  (window as unknown as { Calendly?: CalendlyApi }).Calendly;

// Brand the scheduler to the site palette (paper / gold / slate) and strip the
// chrome we already provide ourselves: the event-details header (our card copy
// says 30 min / video call), the landing-page details and the GDPR banner.
const themed = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=f4f1ea&primary_color=a97e1f&text_color=424952`;

/**
 * "Book a call" — opens Calendly's own native popup widget, restyled only so
 * far as its backdrop matches the project gallery lightbox: same near-black,
 * hand cursor, and clicking the greyed-out area closes it (like the carousel).
 * Falls back to opening the link in a new tab if the widget script hasn't
 * loaded. The URL is set in Sanity (Contact → Calendly booking link).
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
  const open = useCallback(
    (e: React.MouseEvent) => {
      const cal = getCalendly();
      if (cal) {
        e.preventDefault();
        cal.initPopupWidget({ url: themed(url) });
      }
      // else: let the <a href> follow through to a new tab (fallback)
    },
    [url],
  );

  // Backdrop click closes the popup (Calendly's own overlay doesn't). The
  // overlay is injected outside our tree, so listen at the document level and
  // only act on clicks landing on the overlay itself, not the scheduler.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.classList?.contains("calendly-overlay") || t.classList?.contains("calendly-close-overlay")) {
        getCalendly()?.closePopupWidget();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <link rel="stylesheet" href={CAL_CSS} />
      <Script src={CAL_JS} strategy="lazyOnload" />
      {/* backdrop matches the gallery lightbox (.lb); nothing else changes.
          The hand cursor covers both the overlay and Calendly's own invisible
          close-overlay layer (whichever catches the click). */}
      <style>{`
        .calendly-overlay{ background: rgba(18,18,16,0.96) !important; cursor: pointer; }
        .calendly-overlay .calendly-close-overlay{ cursor: pointer; }
        .calendly-overlay .calendly-popup{ cursor: auto; }
      `}</style>
      <a
        href={url}
        onClick={open}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    </>
  );
}

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
        // hugs the month-calendar view (the details header is hidden) — taller
        // values leave a dead band ("chin") under the widget inside the card
        style={{ minWidth: 320, height: 540 }}
      />
      <Script src={CAL_JS} strategy="lazyOnload" />
    </div>
  );
}
