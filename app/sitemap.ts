import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";
import { siteUrl } from "@/app/lib/site";

const BASE = siteUrl;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // slug + real last-edit time, so <lastmod> reflects when the client actually
  // updated each project in the CMS
  const slugs = await client.fetch<
    Array<{ slug: string | null; updated: string | null }>
  >(`*[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    "updated": _updatedAt
  }`);

  const projects: MetadataRoute.Sitemap = slugs
    .filter((s): s is { slug: string; updated: string | null } =>
      Boolean(s.slug),
    )
    .map((s) => ({
      url: `${BASE}/projects/${s.slug}`,
      ...(s.updated ? { lastModified: new Date(s.updated) } : {}),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/estimate`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [...staticPages, ...projects];
}
