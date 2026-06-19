import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Seed the siteSettings singleton with the current bundled hero image, so the
// CMS field is populated and the home page serves it (with Sanity's lqip blur).
// Run with:  npx sanity exec scripts/seed-hero.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  const existing = await client.fetch<{ _id: string; heroImage?: unknown } | null>(
    `*[_type=="siteSettings"][0]{_id, heroImage}`,
  );
  if (existing?.heroImage) {
    console.log("siteSettings already has a hero image — skipping.");
    return;
  }

  const buf = readFileSync(join(process.cwd(), "public", "hero-main.jpg"));
  const asset = await client.assets.upload("image", buf, {
    filename: "hero-main.jpg",
  });
  const image = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };

  if (existing?._id) {
    await client.patch(existing._id).set({ heroImage: image }).commit();
    console.log("Updated existing siteSettings with hero image.");
  } else {
    await client.create({ _type: "siteSettings", heroImage: image });
    console.log("Created siteSettings with hero image.");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
