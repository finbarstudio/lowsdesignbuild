import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

// Turns a Sanity image reference into a CDN URL. You can chain transforms,
// e.g. urlFor(img).width(800).height(600).fit("crop").url() — Sanity resizes
// and serves an optimised image on the fly. This is why Sanity is great for a
// photo-heavy site.
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
