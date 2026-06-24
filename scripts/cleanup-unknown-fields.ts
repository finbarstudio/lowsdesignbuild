import { createClient } from "@sanity/client";

// Remove orphaned fields left over from schema changes so the Studio stops
// flagging "unknown field" warnings.
// Run: npx sanity exec scripts/cleanup-unknown-fields.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  const home = await client.fetch<{ _id: string } | null>(
    `*[_type=="homePage"][0]{_id}`,
  );
  if (home?._id) {
    await client.patch(home._id).unset(["heroTrailImages"]).commit();
    console.log("Removed homePage.heroTrailImages");
  }
  // processSteps was moved off the about page earlier — make sure it's gone too
  const about = await client.fetch<{ _id: string } | null>(
    `*[_type=="aboutPage"][0]{_id}`,
  );
  if (about?._id) {
    await client.patch(about._id).unset(["processSteps"]).commit();
    console.log("Ensured aboutPage.processSteps is removed");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
