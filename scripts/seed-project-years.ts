import { createClient } from "@sanity/client";

// One-off: give every project a completion year (alternating 2024/2025 for now).
// Run with:  npx sanity exec scripts/seed-project-years.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function run() {
  const ids = await client.fetch<string[]>(`*[_type == "project"]._id`);
  let tx = client.transaction();
  ids.forEach((id, i) => {
    const year = i % 2 === 0 ? 2025 : 2024;
    tx = tx.patch(id, (p) => p.set({ year }));
    console.log(`  ${id} → ${year}`);
  });
  await tx.commit();
  console.log(`\nSet year on ${ids.length} projects.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
