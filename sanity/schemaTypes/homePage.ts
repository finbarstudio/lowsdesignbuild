import { defineField, defineType } from "sanity";

// Everything editable on the Home page. A single document (one Home page).
export const homePageType = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      description: "The large image at the top of the home page.",
    }),
    defineField({
      name: "homeHeroText",
      title: "Big slogan",
      type: "string",
      description:
        "The large slogan that scrolls in over the home page (the 'Family run…' line).",
    }),
    defineField({
      name: "heroTrailImages",
      title: "Slogan trail images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "Images that trail the cursor when hovering the big slogan. A handful of project photos.",
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { media: "heroImage" },
    prepare: ({ media }) => ({ title: "Home Page", media }),
  },
});
