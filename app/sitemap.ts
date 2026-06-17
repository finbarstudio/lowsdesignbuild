import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";
import { siteUrl } from "@/app/lib/site";
import { PROJECT_SLUGS_QUERY } from "@/sanity/lib/queries";

const BASE = siteUrl;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await client.fetch<Array<{ slug: string | null }>>(
    PROJECT_SLUGS_QUERY,
  );

  const projects: MetadataRoute.Sitemap = slugs
    .filter((s): s is { slug: string } => Boolean(s.slug))
    .map((s) => ({
      url: `${BASE}/projects/${s.slug}`,
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
