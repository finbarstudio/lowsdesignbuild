import { createClient } from "@sanity/client";

// Seed siteSettings.heroTrailImages with a handful of existing project images,
// so the home-page cursor-trail effect isn't empty on first deploy.
// Run with:  npx sanity exec scripts/seed-hero-trail.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  // Grab up to 6 project main-image references for the trail.
  const projects = await client.fetch<
    Array<{ mainImage?: { asset?: { _ref?: string } } }>
  >(`*[_type=="project" && defined(mainImage.asset)][0...6]{ mainImage }`);

  const refs = projects
    .map((p) => p.mainImage?.asset?._ref)
    .filter((r): r is string => Boolean(r));

  if (refs.length === 0) {
    console.log("No project images found — nothing to seed.");
    return;
  }

  const trail = refs.map((ref, i) => ({
    _type: "image" as const,
    _key: `trail-${i}`,
    asset: { _type: "reference" as const, _ref: ref },
  }));

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="siteSettings"][0]{_id}`,
  );

  if (existing?._id) {
    await client.patch(existing._id).set({ heroTrailImages: trail }).commit();
    console.log(`Updated siteSettings with ${trail.length} trail images.`);
  } else {
    await client.create({ _type: "siteSettings", heroTrailImages: trail });
    console.log(`Created siteSettings with ${trail.length} trail images.`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
