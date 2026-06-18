import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Seed the six services into Sanity so the client has real, editable content.
// Run with:  npx sanity exec scripts/seed-services.ts --with-user-token
// (the --with-user-token flag injects your logged-in Sanity auth as a token)

const token = process.env.SANITY_AUTH_TOKEN;
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const services = [
  { file: "loft.jpg", title: "Loft Conversions", blurb: "Extend up into your unused loft space to maximise the potential of your home." },
  { file: "extensions.jpg", title: "Extensions", blurb: "Open up your home and create a new space that can be tailored to your wants and needs." },
  { file: "renovations.jpg", title: "Renovations", blurb: "Update your home with a fresh new design. We help our clients design and build their dream spaces, adapting their existing properties to create something entirely new." },
  { file: "roofing.jpg", title: "Roofing", blurb: "Roofing services that ensure not only a water-tight building, but a design that works for our clients, using only the best quality materials." },
  { file: "threed.jpg", title: "3D Visualisation", blurb: "A high-end 3D visualisation service to help clients understand their projects before they begin, so they can make the right design choices." },
  { file: "architectural.jpg", title: "Architectural Services", blurb: "High-detail planning drawings for your planning-permission needs." },
];

async function run() {
  // Don't double-seed: skip if services already exist.
  const existing = await client.fetch<number>(`count(*[_type == "service"])`);
  if (existing > 0) {
    console.log(`Already ${existing} service(s) present — skipping seed.`);
    return;
  }

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    const buf = readFileSync(join(process.cwd(), "public", "services", s.file));
    const asset = await client.assets.upload("image", buf, { filename: s.file });
    const doc = await client.create({
      _type: "service",
      title: s.title,
      blurb: s.blurb,
      order: i + 1,
      images: [
        {
          _type: "image",
          _key: `img-${i}`,
          asset: { _type: "reference", _ref: asset._id },
        },
      ],
    });
    console.log(`Created service: ${doc.title}`);
  }
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
