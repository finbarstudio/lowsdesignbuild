import { createClient } from "@sanity/client";

// Seed the Estimate page info tooltips with the built-in defaults so the client
// sees and can edit the explanations in the Studio.
// Run with:  npx sanity exec scripts/seed-estimate-info.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

const TIPS: Array<{ key: string; text: string }> = [
  {
    key: "finish",
    text: "Standard is a quality, functional finish. High-end adds 10% for premium materials and detailing; luxury adds 20% for bespoke, top-tier specification throughout.",
  },
  {
    key: "complexity",
    text: "Reflects how involved the build is — awkward layouts, structural challenges or phasing push this from standard to moderate or high.",
  },
  {
    key: "steel",
    text: "How much structural steelwork the design needs — larger spans and multiple beams increase complexity.",
  },
  {
    key: "opening",
    text: "The opening between the existing house and the new space — wider, full-width openings need more steel support.",
  },
  {
    key: "access",
    text: "How easily materials and skips can reach the work area. Restricted or no side access adds labour and time.",
  },
  {
    key: "conservation",
    text: "Stricter planning controls and material requirements apply in a designated conservation area.",
  },
  {
    key: "article4",
    text: "An Article 4 Direction removes permitted-development rights, so works need full planning permission.",
  },
  {
    key: "ashp",
    text: "Allowing for connection and interface with an air-source heat pump system.",
  },
  {
    key: "basement",
    text: "Structural tie-in where the works connect to or sit above an existing basement.",
  },
  {
    key: "drainage",
    text: "Rerouting existing drainage runs that clash with the new structure.",
  },
  {
    key: "sewer",
    text: "A build-over agreement with the water authority where the structure sits over a public sewer.",
  },
  {
    key: "partyWall",
    text: "A Party Wall agreement is needed when you build on or near a shared boundary; each adjoining neighbour usually needs their own award.",
  },
];

async function run() {
  const infoTips = TIPS.map((t, i) => ({ _key: `tip${i}`, ...t }));
  await client.createOrReplace({
    _id: "estimatePage",
    _type: "estimatePage",
    infoTips,
  });
  console.log(`Seeded ${infoTips.length} estimate info tooltips.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
