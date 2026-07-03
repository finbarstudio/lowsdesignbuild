"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

const CAL_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CAL_JS = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyApi = {
  initPopupWidget: (o: { url: string }) => void;
  initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void;
};

const getCalendly = () =>
  (window as unknown as { Calendly?: CalendlyApi }).Calendly;

// Brand the scheduler to the site palette (paper / gold / slate).
const themed = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1&background_color=f4f1ea&primary_color=a97e1f&text_color=424952`;

/**
 * "Book a call" — opens the Calendly scheduler in a popup overlay. Falls back to
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

  return (
    <>
      <link rel="stylesheet" href={CAL_CSS} />
      <Script src={CAL_JS} strategy="lazyOnload" />
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
    // On mobile this sits INSIDE the page's FORM_CARD (which carries the "Or
    // book a call" label), so it goes borderless + flush there — the page label
    // is the single heading; no duplicate title inside.
    <div className="grid gap-0 overflow-hidden rounded-sm border border-line bg-background max-sm:rounded-none max-sm:border-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* left: host / meeting info */}
      <div className="flex flex-col gap-4 border-b border-line p-7 max-sm:px-0 max-sm:pt-0 md:border-b-0 md:border-r">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper-deep">
          Lows Design &amp; Build
        </span>
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
      <div className="p-7 max-sm:px-0 max-sm:pb-0">
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
    <>
      <link rel="stylesheet" href={CAL_CSS} />
      <div
        ref={ref}
        className="w-full overflow-hidden rounded-sm"
        style={{ minWidth: 320, height: 700 }}
      />
      <Script src={CAL_JS} strategy="lazyOnload" />
    </>
  );
}
