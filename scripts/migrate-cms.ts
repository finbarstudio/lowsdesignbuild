import { createClient } from "@sanity/client";

// One-off migration: split the old `siteSettings` singleton into page-shaped
// documents (homePage, aboutPage, family, contact). Re-uses the existing asset
// references (no re-upload). Safe to re-run — uses fixed ids + createOrReplace.
// Run with:  npx sanity exec scripts/migrate-cms.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  const old = await client.fetch<Record<string, unknown> | null>(
    `*[_type=="siteSettings"][0]`,
  );

  if (!old) {
    console.log("No siteSettings document found — nothing to migrate.");
    return;
  }

  const tx = client.transaction();

  tx.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    heroImage: old.heroImage,
    heroTrailImages: old.heroTrailImages,
    homeHeroText: old.homeHeroText,
  });

  tx.createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    aboutHeroText: old.aboutHeroText,
    familyBio: old.familyBio,
    processSteps: old.processSteps,
  });

  tx.createOrReplace({
    _id: "family",
    _type: "family",
    teamLead: old.teamLead,
    team: old.team,
  });

  tx.createOrReplace({
    _id: "contact",
    _type: "contact",
    contactEmail: old.contactEmail,
    areas: old.areas,
  });

  await tx.commit();
  console.log("Created homePage, aboutPage, family, contact from siteSettings.");

  // Remove the old catch-all document now its data has moved.
  if (typeof old._id === "string") {
    await client.delete(old._id);
    console.log(`Deleted old siteSettings document (${old._id}).`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
