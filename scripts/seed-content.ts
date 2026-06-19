import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Seed the editable copy + people into siteSettings, uploading the bundled team
// photos as assets, so the client can edit everything from the Studio.
// Run with:  npx sanity exec scripts/seed-content.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function uploadImage(relPath: string, filename: string) {
  const buf = readFileSync(join(process.cwd(), "public", relPath));
  const asset = await client.assets.upload("image", buf, { filename });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function run() {
  const existing = await client.fetch<{
    _id: string;
    teamLead?: unknown;
    team?: unknown[];
  } | null>(`*[_type=="siteSettings"][0]{_id, teamLead, team}`);

  const homeHeroText = "Family run start to finish construction services";
  const aboutHeroText =
    "A family-run design & build company in Greater London";
  const familyBio = [
    "We handle the whole job, from the first drawings to completion, so there's only one team to deal with and the process stays simple for you.",
    "From the first conversation to the final finish, that same team takes responsibility for everything: the drawings, the approvals, the construction and the finish.",
    "We care about the quality of our work and always aim for a high standard. Everything comes with guarantees, so you know it meets the required specification.",
  ].join("\n\n");

  const processSteps = [
    {
      _key: "step1",
      title: "Consultation",
      text: "We meet to discuss your project and provide a free, no-obligation estimate for the works.",
    },
    {
      _key: "step2",
      title: "Architectural Services",
      text: "We provide all the architectural and engineering drawings, and handle local authorities and building control.",
    },
    {
      _key: "step3",
      title: "Construction",
      text: "Our team undertakes all the building works start to finish, communicating with you throughout.",
    },
    {
      _key: "step4",
      title: "The Finishing Touches",
      text: "We go above and beyond to make sure the final finish is of a very high quality.",
    },
  ];

  const areas = [
    "Beckenham",
    "Bromley",
    "Chislehurst",
    "Dulwich",
    "West Wickham",
    "Orpington",
    "Streatham",
    "Sidcup",
    "Lewisham",
    "Sevenoaks",
  ];

  // Text + process always (re)set. People only seeded once, so we don't clobber
  // any photos the client has already swapped in.
  const patch: Record<string, unknown> = {
    homeHeroText,
    aboutHeroText,
    familyBio,
    processSteps,
    areas,
    contactEmail: "info@lowsdesignandbuild.com",
  };

  const hasPeople =
    existing?.teamLead || (existing?.team && existing.team.length > 0);

  if (!hasPeople) {
    console.log("Uploading team photos…");
    const leadImg = await uploadImage("team/sam-james.jpg", "sam-james.jpg");
    const patImg = await uploadImage("team/pat.jpg", "pat.jpg");
    const shaneImg = await uploadImage("team/shane.jpg", "shane.jpg");
    const philImg = await uploadImage("team/phil.jpg", "phil.jpg");

    patch.teamLead = {
      image: leadImg,
      alt: "Samuel and James Low",
      people: [
        { _key: "p1", name: "Samuel Low", role: "Director" },
        { _key: "p2", name: "James Low", role: "Director" },
      ],
    };
    patch.team = [
      { _key: "t1", name: "Patrick Low", role: "Project Manager", image: patImg },
      {
        _key: "t2",
        name: "Shane (Honorary Low)",
        role: "Carpentry Specialist",
        image: shaneImg,
      },
      {
        _key: "t3",
        name: "Phil (Honorary Low)",
        role: "Roofing Specialist",
        image: philImg,
      },
    ];
  } else {
    console.log("People already present — leaving teamLead/team untouched.");
  }

  if (existing?._id) {
    await client.patch(existing._id).set(patch).commit();
    console.log("Updated siteSettings with editable content.");
  } else {
    await client.create({ _type: "siteSettings", ...patch });
    console.log("Created siteSettings with editable content.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
