import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

// Bulk-replace the portfolio with the projects from the live lowsdesignandbuild
// .com site (content extracted from each project page; images pulled at full
// res from the Wix CDN and re-uploaded to Sanity).
// Run: npx sanity exec scripts/migrate-projects.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

const BASE = "https://static.wixstatic.com/media/104813_";
const u = (hash: string, ext: string) => `${BASE}${hash}~mv2.${ext}`;

type P = {
  location: string;
  title: string;
  category: "Loft Conversion" | "Extension" | "Refurbishment" | "Roofing";
  year: number;
  description: string;
  images: string[];
};

const PROJECTS: P[] = [
  {
    location: "Wimbledon Village",
    title: "Refurbishment",
    category: "Refurbishment",
    year: 2024,
    description:
      "We transformed this property with a sleek, modern design, featuring custom joinery throughout to maximize space-saving storage. The flats hadn't been updated since they were built, so we had a significant challenge in creating a contemporary space for our clients. We expanded the kitchen, living, and dining areas, installed luxury vinyl tile (LVT) flooring throughout, redecorated three bedrooms, and completely renovated two bathrooms.",
    images: [
      u("5719d1cbe3b347ce8b7d17cce8723758", "jpg"),
      u("b28e0ac02c334b18aba15de16fdfb69f", "jpg"),
      u("f95da60ac9fe492588dab5326d818dde", "jpg"),
      u("514e07fe13324225adcda553e28e7f5f", "jpg"),
      u("4c04011497ef4594af8ddcabd5843347", "jpg"),
      u("60fa4617d88e447cac2d58f456274689", "jpg"),
      u("b327108adc6e4d87a9a383faf2e31aa1", "jpg"),
      u("bf9bd627c6e14258b3b8c78ebe3acdd2", "jpg"),
      u("82b3de54cdbb45d9aec4c3b6d1a00327", "jpg"),
    ],
  },
  {
    location: "West Wickham",
    title: "Extension, Loft Conversion & Refurbishment",
    category: "Extension",
    year: 2024,
    description:
      "We are thrilled to present our latest project where we transformed a property into a stunning living space. Our team created a 2 storey side extension, single storey rear extension, dormer loft conversion and a porch extension. With these additions, we were able to create 4 bathrooms, an open plan kitchen/living/dining area, a contained flat, 2 new bedrooms on the first floor and a master bedroom in the loft. We are proud to have delivered a beautiful and functional living space for our clients.",
    images: [
      u("17f778a6bf754bec88df9c9181f65c1e", "jpeg"),
      u("1a3a989e4f2644f09fd41184477cadb6", "jpeg"),
      u("aff65643cdcd4c749c1b6c4ef073f518", "jpeg"),
      u("cccb758731bb4ca6930de9d2a9eb4075", "jpeg"),
      u("5f793638766045ec92bf52eaaabc8438", "jpeg"),
    ],
  },
  {
    location: "Clock House",
    title: "Extension & Refurbishment",
    category: "Extension",
    year: 2024,
    description:
      "We are excited to showcase a distinctive project where we built a rear extension to provide our client with a spacious kitchen and dining area. The zinc cladding construction, both on the face and roof, adds a touch of sophistication to the overall design. We installed two large roof lights into the pitches of the roof to maximize light into the kitchen area. The internal has been transformed, with the install of a modern kitchen, along with beautiful LVT flooring.",
    images: [
      u("c473f4ad4f204e76ab56b668ed470b8b", "jpeg"),
      u("236772c1efda4f2b8664e19f832dd6d0", "jpeg"),
      u("d0c2849dc74c45ebaa965461902b09ef", "jpeg"),
      u("301ac6903eb04260a7c55423a2050f66", "jpeg"),
      u("fa69935ec0a3488d8bc9de926bb90d1e", "jpeg"),
    ],
  },
  {
    location: "Nunhead",
    title: "Loft Conversion & Refurbishment",
    category: "Loft Conversion",
    year: 2024,
    description:
      "The team created a 2 storey side extension, single storey rear extension, dormer loft conversion and a porch extension, resulting in 4 bathrooms, an open plan kitchen/living/dining area, a contained flat, 2 new bedrooms on the first floor and a master bedroom in the loft.",
    images: [
      u("2a373d30ffe04de4bdbe8610f01532c9", "jpeg"),
      u("913a2abb8d494dff89315107f640c633", "jpeg"),
      u("5d6512bc7b9a4d7bb9fe901ea3d7afdc", "jpeg"),
      u("2350cc746c4546e3b794a846f655ca4f", "jpeg"),
      u("43a05083a6234b3da2994c7286966b0f", "jpeg"),
      u("020ec598a1ce4badaf3e232fe63449a6", "jpeg"),
      u("df541993767d43fb9466df69ff2e26be", "jpeg"),
    ],
  },
  {
    location: "Bromley",
    title: "Refurbishment",
    category: "Refurbishment",
    year: 2023,
    description:
      "The refurbishment project was completed before Christmas. The team restored traditional architectural elements including tall skirtings, classic coving, and custom joinery centred around a fireplace. Design details emphasised layered lighting, herringbone flooring, and wall panelling to restore the property's original charm and character. The client was able to enjoy the completed space during the festive season.",
    images: [
      u("1de5b2096c3347f783925bbdf32ca606", "jpg"),
      u("8d913f896b4f4e7a871f62d78feae9d0", "jpg"),
      u("827f76e66f8c42ad82547b6595eba0f2", "png"),
      u("f51fe42efb794253ad259b15c1e7873d", "jpg"),
      u("bef0ab5636294335869aadde520ff5a8", "jpg"),
      u("e6c0ad308b5b41af9198922b46dcd590", "jpg"),
      u("bf669a597e4f4a1db9a22a36cc8c52db", "jpg"),
    ],
  },
  {
    location: "Orpington",
    title: "Loft Conversion",
    category: "Loft Conversion",
    year: 2023,
    description:
      "We completed a loft conversion which created 2 additional bedrooms with 2 ensuite bathrooms, turning a bungalow into a large family home. Our client wanted a modern finish, so we worked with them to select the right materials to achieve their goals.",
    images: [
      u("1d3653c33c664dbd91bbaa179dc3eebf", "jpeg"),
      u("61a67a1808f646d69dc3aa4da2ac1f7e", "jpg"),
      u("f2947c6bf9984afc81c5baedab00c813", "jpeg"),
      u("36dc96b39c53455f88676ca2e0a1682b", "jpg"),
    ],
  },
  {
    location: "Orpington",
    title: "Garage Conversion & Extension",
    category: "Extension",
    year: 2023,
    description:
      "We transformed the space occupied by an old garage lean-to into a double bedroom with a spacious en-suite shower room. This was made possible by extending the existing foundations to increase the square footage of the extension. Below are pictures of the completed project, and a picture showing how the space looked before.",
    images: [
      u("4ceadc6571564843aed5496222d77727", "jpg"),
      u("032b0e2cf85e419c999590ba977e3cd3", "jpg"),
      u("2bd41731624f4ad78bbabeaf559ab106", "jpg"),
      u("bfd0bcd7ab734402be45fec23f815345", "jpg"),
    ],
  },
  {
    location: "Beckenham",
    title: "Rear Extension",
    category: "Extension",
    year: 2023,
    description:
      "We completed a 4m rear extension to a terraced property in Beckenham. This flat roof extension included bifold doors alongside 3 rooflights to make the new area as naturally bright as possible. We installed Herringbone style LVT flooring throughout the property which offsets the new shaker style kitchen perfectly.",
    images: [
      u("0491c0a2edce46eb965e7190f35e8bc7", "png"),
      u("4467d49ccca54f35af5b31f79f8bbd8c", "png"),
      u("e9353833b11a4bf893c4adacdd02582d", "png"),
      u("9d3d4b08dfbb4d30bcb01d7411d6cdf5", "png"),
    ],
  },
  {
    location: "Chislehurst",
    title: "Loft Conversion",
    category: "Loft Conversion",
    year: 2022,
    description:
      "We constructed a dormer on a semi-detached property in Chislehurst which created space for 2 new bedrooms and a bathroom. It was designed to match in seamlessly to the existing roof by matching the new and the old tiles.",
    images: [
      u("8700e07a3cf547149f47f07487aaa1d6", "jpeg"),
      u("d678cd051ec348b8a1f95becf997d60f", "jpeg"),
      u("33e97bb380c7465bbbb28dc13b774ac9", "jpg"),
    ],
  },
  {
    location: "Hampton Court",
    title: "Roofing",
    category: "Roofing",
    year: 2022,
    description:
      "We completed a roofing project which included a 3 layer flat-roofing system, lead work, tiling and Velux window installation. Please see below some images of the completed project.",
    images: [
      u("21793b240f9e43e594c285667c3a5efd", "jpg"),
      u("2056e56b01854f1ea59c31f5c71ac7b8", "jpg"),
    ],
  },
  {
    location: "Lee",
    title: "Rear Extension",
    category: "Extension",
    year: 2022,
    description:
      "We completed an extension on a terraced Victorian property in Lee to create space for a new kitchen and downstairs bathroom.",
    images: [u("0c398aae3bf74c17b63fd755133fc0df", "jpg")],
  },
];

async function uploadImage(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = url.split("/").pop() || "image.jpg";
  const asset = await client.assets.upload("image", buf, { filename });
  return asset._id;
}

const ref = (id: string) => ({
  _type: "image",
  asset: { _type: "reference", _ref: id },
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function run() {
  // 1. clear featured-project references so the projects can be deleted
  const home = await client.fetch<{ _id: string } | null>(
    `*[_type=="homePage"][0]{_id}`,
  );
  if (home?._id) {
    await client.patch(home._id).unset(["featuredProjects"]).commit();
    console.log("Cleared homePage.featuredProjects");
  }

  // 2. delete every existing project
  await client.delete({ query: '*[_type=="project"]' });
  console.log("Deleted existing projects");

  // 3. upload images + create the new projects
  let order = 0;
  for (const p of PROJECTS) {
    process.stdout.write(`\n${p.location} — ${p.title}\n`);
    const ids: string[] = [];
    for (const url of p.images) {
      try {
        ids.push(await uploadImage(url));
        process.stdout.write("  ✓ image\n");
      } catch (e) {
        process.stdout.write(`  ✗ ${(e as Error).message}\n`);
      }
    }
    if (ids.length === 0) {
      process.stdout.write("  (no images uploaded — skipped)\n");
      continue;
    }
    await client.create({
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: slugify(`${p.location} ${p.title}`) },
      location: p.location,
      category: p.category,
      year: p.year,
      description: p.description,
      order: order++,
      mainImage: ref(ids[0]),
      gallery: ids.slice(1).map((id) => ({ ...ref(id), _key: randomUUID() })),
    });
    process.stdout.write("  → created\n");
  }
  console.log("\nDone.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
