import { createClient } from "@sanity/client";

// One-off CMS patches from the client's feedback round.
// Run: npx sanity exec scripts/patch-feedback.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  // Home big slogan reword.
  const home = await client.fetch<{ _id: string } | null>(
    `*[_type=="homePage"][0]{_id}`,
  );
  if (home?._id) {
    await client
      .patch(home._id)
      .set({
        homeHeroText:
          "Family Run Construction Services in London and Surrounding Areas",
      })
      .commit();
    console.log("Patched homePage.homeHeroText");
  } else {
    console.log("No homePage doc found");
  }

  // Broaden the areas-we-cover list.
  const contact = await client.fetch<{ _id: string } | null>(
    `*[_type=="contact"][0]{_id}`,
  );
  if (contact?._id) {
    await client
      .patch(contact._id)
      .set({
        areas: [
          "South London",
          "North London",
          "East London",
          "West London",
          "Greater London",
          "Kent",
          "Essex",
        ],
      })
      .commit();
    console.log("Patched contact.areas");
  } else {
    console.log("No contact doc found");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
