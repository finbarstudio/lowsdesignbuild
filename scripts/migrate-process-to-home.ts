import { createClient } from "@sanity/client";

// 'Our process' now renders on the HOME page (swapped with the team), so move
// its data from the about-page document to the home-page document.
// Run: npx sanity exec scripts/migrate-process-to-home.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  const about = await client.fetch<{ _id: string; processSteps?: unknown[] } | null>(
    `*[_type=="aboutPage"][0]{_id, processSteps}`,
  );
  const home = await client.fetch<{ _id: string } | null>(
    `*[_type=="homePage"][0]{_id}`,
  );
  if (!home?._id) {
    console.log("No home page doc");
    return;
  }
  const steps = about?.processSteps ?? [];
  await client.patch(home._id).set({ processSteps: steps }).commit();
  console.log(`Copied ${steps.length} process steps to the home page`);
  if (about?._id) {
    await client.patch(about._id).unset(["processSteps"]).commit();
    console.log("Cleared processSteps from the about page");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
