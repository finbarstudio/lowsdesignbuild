import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

// One-off: set a curated colour palette on the Dulwich hallway project, led by
// the Farrow & Ball 'Treron Satin' it mentions, plus its black/white accents.
// Run with:  npx sanity exec scripts/seed-dulwich-palette.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

const ID = "project-DVwF-knDbel"; // Dulwich — Traditional Hallway Restoration

const palette = [
  { _key: randomUUID(), color: "#1C1C1A", name: "Off-Black" },
  { _key: randomUUID(), color: "#5A5C4D", name: "F&B Treron Satin" },
  { _key: randomUUID(), color: "#EDE8DD", name: "Chalk White" },
];

async function run() {
  await client.patch(ID).set({ palette }).commit();
  console.log(`Set ${palette.length}-tile palette on ${ID}.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
