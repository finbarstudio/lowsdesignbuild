import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

// Turns a Sanity image reference into a CDN URL. You can chain transforms,
// e.g. urlFor(img).width(800).height(600).fit("crop").url() — Sanity resizes
// and serves an optimised image on the fly. This is why Sanity is great for a
// photo-heavy site.
const builder = createImageUrlBuilder({ projectId, dataset });

// Every image gets the same baseline treatment so lower-quality source photos
// (low-res, compressed, slightly soft) come out crisp:
//  - auto("format")  → modern formats (avif/webp), less compression mush
//  - quality(86)     → fewer JPEG artefacts than the default 75
//  - sharpen(35)     → counteracts softness / upscaling blur
// Callers can still chain .width()/.height()/.quality()/etc. to override.
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format").quality(86).sharpen(35);
}

// The untouched original asset — no resize, format change, quality drop or
// sharpen. Used by the project gallery lightbox, where we want the full native
// image at maximum quality (no compression, no crop).
export function urlForOriginal(source: SanityImageSource) {
  return builder.image(source);
}
