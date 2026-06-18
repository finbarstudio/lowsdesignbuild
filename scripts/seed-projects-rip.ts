import { createClient } from "@sanity/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Adds the named projects ripped from the live Wix /projects pages that aren't
// already in the CMS. Images were downloaded to /tmp/lows_rip.
// Run with:  npx sanity exec scripts/seed-projects-rip.ts --with-user-token

const DIR = "/tmp/lows_rip";
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// prefix = the file stem in /tmp/lows_rip; order = first file is the mainImage.
const projects = [
  {
    prefix: "hampton-roof",
    slug: "hampton-court-roof",
    title: "Hampton Court — Roof",
    location: "Hampton Court",
    category: "Roofing",
    description:
      "A roofing project including a 3-layer flat-roofing system, lead work, tiling and Velux window installation.",
    order: 20,
  },
  {
    prefix: "orpington-loft",
    slug: "orpington-loft-conversion",
    title: "Orpington — Loft Conversion",
    location: "Orpington",
    category: "Loft Conversion",
    description:
      "A loft conversion creating two additional bedrooms with two en-suite bathrooms, turning a bungalow into a large family home. The client wanted a modern finish, so we worked with them to select the right materials to achieve their goals.",
    order: 21,
  },
  {
    prefix: "orpington-garage",
    slug: "orpington-garage-conversion-extension",
    title: "Orpington — Garage Conversion & Extension",
    location: "Orpington",
    category: "Extension",
    description:
      "We transformed the space occupied by an old garage lean-to into a double bedroom with a spacious en-suite shower room, made possible by extending the existing foundations to increase the square footage. Below are the completed project and a picture showing how the space looked before.",
    order: 22,
  },
  {
    prefix: "lee-extension",
    slug: "lee-extension",
    title: "Lee — Extension",
    location: "Lee",
    category: "Extension",
    description:
      "An extension on a terraced Victorian property in Lee to create space for a new kitchen and downstairs bathroom.",
    order: 23,
  },
  {
    prefix: "beckenham-extension",
    slug: "beckenham-rear-extension",
    title: "Beckenham — Rear Extension",
    location: "Beckenham",
    category: "Extension",
    description:
      "A 4m rear extension to a terraced property in Beckenham. This flat-roof extension included bifold doors alongside three rooflights to make the new area as naturally bright as possible. We installed herringbone-style LVT flooring throughout, which offsets the new shaker-style kitchen perfectly.",
    order: 24,
  },
];

async function run() {
  const allFiles = readdirSync(DIR);
  for (const p of projects) {
    // skip if a project with this slug already exists
    const exists = await client.fetch<number>(
      `count(*[_type=="project" && slug.current==$slug])`,
      { slug: p.slug },
    );
    if (exists > 0) {
      console.log(`Skip (exists): ${p.title}`);
      continue;
    }

    const files = allFiles
      .filter((f) => f.startsWith(`${p.prefix}-`))
      .sort((a, b) => {
        const na = Number(a.match(/-(\d+)\./)?.[1] ?? 0);
        const nb = Number(b.match(/-(\d+)\./)?.[1] ?? 0);
        return na - nb;
      });
    if (files.length === 0) {
      console.log(`No images for ${p.title} — skipping`);
      continue;
    }

    const assetIds: string[] = [];
    for (const f of files) {
      const buf = readFileSync(join(DIR, f));
      const asset = await client.assets.upload("image", buf, { filename: f });
      assetIds.push(asset._id);
    }

    const [main, ...rest] = assetIds;
    const doc = await client.create({
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      location: p.location,
      category: p.category,
      description: p.description,
      order: p.order,
      mainImage: { _type: "image", asset: { _type: "reference", _ref: main } },
      gallery: rest.map((id, i) => ({
        _type: "image",
        _key: `g-${i}`,
        asset: { _type: "reference", _ref: id },
      })),
    });
    console.log(`Created: ${doc.title} (${files.length} img)`);
  }
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
