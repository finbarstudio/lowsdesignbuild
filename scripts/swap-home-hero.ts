import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

// Use the first project's (Wimbledon — Refurbishment) hero photo as the home
// page main hero, and give that project a different hero from its own gallery.
// Run: npx sanity exec scripts/swap-home-hero.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

type ImgRef = { asset?: { _ref?: string } };

async function run() {
  const proj = await client.fetch<{
    _id: string;
    title: string;
    mainImage: ImgRef;
    gallery: Array<ImgRef & { _key?: string }> | null;
  } | null>(
    `*[_type=="project"]|order(coalesce(order,999) asc)[0]{_id, title, mainImage, gallery}`,
  );
  if (!proj?.mainImage?.asset?._ref) {
    console.log("No first project / hero found");
    return;
  }
  const gallery = proj.gallery ?? [];
  if (gallery.length === 0 || !gallery[0]?.asset?._ref) {
    console.log("First project has no gallery image to promote — aborting");
    return;
  }

  const oldHeroRef = proj.mainImage.asset._ref;
  const newHero = gallery[0];

  // project: promote gallery[0] to hero, move old hero into the gallery
  await client
    .patch(proj._id)
    .set({
      mainImage: {
        _type: "image",
        asset: { _type: "reference", _ref: newHero.asset!._ref },
      },
      gallery: [
        {
          _type: "image",
          _key: randomUUID(),
          asset: { _type: "reference", _ref: oldHeroRef },
        },
        ...gallery.slice(1),
      ],
    })
    .commit();
  console.log(`Project "${proj.title}" hero swapped to a gallery image`);

  // home page: use the project's old hero as the main hero
  const home = await client.fetch<{ _id: string } | null>(
    `*[_type=="homePage"][0]{_id}`,
  );
  if (home?._id) {
    await client
      .patch(home._id)
      .set({
        heroImage: {
          _type: "image",
          asset: { _type: "reference", _ref: oldHeroRef },
        },
      })
      .commit();
    console.log("Home page hero set to the project's photo");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
