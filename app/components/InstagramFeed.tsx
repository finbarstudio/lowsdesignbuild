"use client";

import { createElement, useEffect } from "react";

/**
 * Live Instagram feed via Behold.so — a `<behold-widget>` web component fed by a
 * feed ID set in the CMS. Behold connects to @lowsdesignandbuild and the layout
 * (grid, gaps, rounding) is configured in the Behold dashboard to match the site.
 * Loads Behold's module script once on mount.
 */
export default function InstagramFeed({ feedId }: { feedId: string }) {
  useEffect(() => {
    // The widget renders in a CLOSED shadow root, so its "Made with Behold"
    // badge can't be reached with CSS. It is, however, driven by a
    // `showBranding` flag in the feed JSON the widget fetches — so wrap
    // window.fetch (before the widget script loads) and flip the flag on
    // Behold feed responses. Everything else passes through untouched.
    const w = window as unknown as { __beholdDebranded?: boolean };
    if (!w.__beholdDebranded) {
      w.__beholdDebranded = true;
      const orig = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        const res = await orig(input, init);
        if (!url.includes("feeds.behold.so")) return res;
        try {
          const data = await res.clone().json();
          data.showBranding = false;
          // Force a 2×2 grid on mobile. Breakpoint keys are MAX container
          // widths (the widget picks the smallest key that still fits), so a
          // "639" entry applies whenever the feed is phone-width. Desktop
          // keeps the dashboard-configured default (4 across).
          if (data.widgetSettings?.breakpoints?.default) {
            data.widgetSettings.breakpoints["639"] = {
              ...data.widgetSettings.breakpoints.default,
              numColumns: 2,
              numPosts: 4,
            };
          }
          return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return res; // not JSON / parse failure — hand back the original
        }
      };
    }

    const id = "behold-widget-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.type = "module";
    s.src = "https://w.behold.so/widget.js";
    document.body.appendChild(s);
  }, []);

  return (
    // standard page gutter (was px-[10%] on mobile — far too much inset)
    <div className="mx-auto max-w-[1900px] px-4 sm:px-6">
      {createElement("behold-widget", { "feed-id": feedId })}
    </div>
  );
}
