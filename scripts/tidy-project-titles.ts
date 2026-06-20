import { createClient } from "@sanity/client";

// One-off: strip place names from project titles and make them succinct (the
// location already shows as its own pill on the cards). Run with:
//   npx sanity exec scripts/tidy-project-titles.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// Explicit, hand-checked rewrites keyed by document id. Titles already short
// and place-name-free are left out (untouched).
const RENAMES: Record<string, string> = {
  "project-DNH9yKdKqm7": "Loft Conversion & Rear Extension",
  HipUx4AkhoAVzOqaoKDWoP: "Rear Extension",
  "project-DVYVVBtjQKr": "Renovation & Extension",
  HipUx4AkhoAVzOqaoKDVk9: "Roof Works",
  v2QPAS0EbzGFgyFjtZ1Cgv: "Single-Storey Extension",
  v2QPAS0EbzGFgyFjtZ1CQm: "Garage Conversion & Extension",
  lam0QrU1I74uWM1Y3qC0zD: "Loft Conversion",
};

async function run() {
  let tx = client.transaction();
  let n = 0;
  for (const [id, title] of Object.entries(RENAMES)) {
    tx = tx.patch(id, (p) => p.set({ title }));
    n++;
    console.log(`  ${id} → "${title}"`);
  }
  await tx.commit();
  console.log(`\nUpdated ${n} project titles.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
