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
