import type { MetadataRoute } from "next";

import { siteUrl } from "@/app/lib/site";

const BASE = siteUrl;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
