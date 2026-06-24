import { createClient } from "@sanity/client";

// Add placeholder bios to the two directors so the split-photo reveal has copy.
// Run: npx sanity exec scripts/seed-director-bios.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

const BIOS: Record<string, string> = {
  "Samuel Low":
    "Placeholder bio — Samuel co-founded Lows and leads on design and client relationships, shaping each project from the first sketch. Edit this in the CMS.",
  "James Low":
    "Placeholder bio — James co-founded Lows and runs the build side, making sure every project is delivered to the standard the family puts its name to. Edit this in the CMS.",
};

type Person = { _key?: string; name?: string; role?: string; bio?: string };

async function run() {
  const fam = await client.fetch<{
    _id: string;
    people: Person[] | null;
  } | null>(`*[_type=="family"][0]{_id, "people": teamLead.people}`);
  if (!fam?._id) {
    console.log("No family doc");
    return;
  }
  const people = (fam.people ?? []).map((p) => ({
    ...p,
    bio: (p.name && BIOS[p.name]) || p.bio || "",
  }));
  await client.patch(fam._id).set({ "teamLead.people": people }).commit();
  console.log(`Patched ${people.length} director bios`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
