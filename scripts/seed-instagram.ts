import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Seed the home-page Instagram strip from the scraped posts (site_mirror/
// instagram). Uploads each post's first image and links to the real post.
// Run with:  npx sanity exec scripts/seed-instagram.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

const IG_DIR = join(process.cwd(), "..", "site_mirror", "instagram");

type ScrapedPost = { shortcode: string; url: string };

async function run() {
  const posts: ScrapedPost[] = JSON.parse(
    readFileSync(join(IG_DIR, "posts_structured.json"), "utf8"),
  );

  const items: Array<Record<string, unknown>> = [];
  let n = 0;
  for (const p of posts) {
    const imgPath = join(IG_DIR, "images", `${p.shortcode}_0.jpg`);
    if (!existsSync(imgPath)) {
      console.log(`skip ${p.shortcode} (no local image)`);
      continue;
    }
    const asset = await client.assets.upload(
      "image",
      readFileSync(imgPath),
      { filename: `ig-${p.shortcode}.jpg` },
    );
    items.push({
      _type: "object",
      _key: `ig${n++}`,
      url: p.url,
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    });
    console.log(`uploaded ${p.shortcode}`);
  }

  if (items.length === 0) {
    console.log("No Instagram images found — nothing to seed.");
    return;
  }

  await client.patch("homePage").set({ instagramPosts: items }).commit();
  console.log(`Set ${items.length} Instagram posts on homePage.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
