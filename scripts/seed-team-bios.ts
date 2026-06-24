import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

// Add placeholder bios to the team members and add Athena (Operations Manager)
// with a placeholder image + bio.
// Run: npx sanity exec scripts/seed-team-bios.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// clearly-marked placeholders, keyed by member name
const BIOS: Record<string, string> = {
  "Shane (Honorary Low)":
    "Placeholder bio — Shane leads our carpentry and bespoke joinery, bringing precision and a careful eye to every fitted detail. Edit this in the CMS.",
  "Phil (Honorary Low)":
    "Placeholder bio — Phil heads up our roofing, from flat-roof systems to leadwork, tiling and Velux installs. Edit this in the CMS.",
  "Patrick Low":
    "Placeholder bio — Patrick keeps every project moving on site, coordinating trades and timelines so the build runs smoothly. Edit this in the CMS.",
  "Athena Low":
    "Placeholder bio — Athena runs operations behind the scenes, keeping schedules, suppliers and clients moving in step. Edit this in the CMS.",
};

type Member = {
  _key?: string;
  name?: string;
  role?: string;
  bio?: string;
  image?: unknown;
};

async function uploadPlaceholder(): Promise<string> {
  const url =
    "https://placehold.co/800x1000/e7e3da/8a8a8a/png?text=Athena%5CnOperations+Manager";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`placeholder fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, {
    filename: "athena-placeholder.png",
  });
  return asset._id;
}

async function run() {
  const fam = await client.fetch<{ _id: string; team: Member[] | null } | null>(
    `*[_type=="family"][0]{_id, team}`,
  );
  if (!fam?._id) {
    console.log("No family doc");
    return;
  }
  const team: Member[] = (fam.team ?? []).map((m) => ({
    ...m,
    _key: m._key || randomUUID(),
    bio: (m.name && BIOS[m.name]) || m.bio || "",
  }));

  // add Athena if not already present
  if (!team.some((m) => (m.name || "").toLowerCase().includes("athena"))) {
    const imgId = await uploadPlaceholder();
    team.push({
      _key: randomUUID(),
      name: "Athena Low",
      role: "Operations Manager",
      bio: BIOS["Athena Low"],
      image: { _type: "image", asset: { _type: "reference", _ref: imgId } },
    });
    console.log("Added Athena (Operations Manager) with placeholder image");
  }

  await client.patch(fam._id).set({ team }).commit();
  console.log(`Patched team — ${team.length} members, bios added.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
