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
