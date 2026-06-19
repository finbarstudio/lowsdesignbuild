import { defineField, defineType } from "sanity";

// Site-wide settings — a single document. For now it holds the home page hero
// image so the client can swap it without code. Sanity stores the original and
// generates a tiny low-res blur (lqip) automatically, which we use as an
// instant placeholder.
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Home hero image",
      type: "image",
      description: "The large image at the top of the home page.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { media: "heroImage" },
    prepare: ({ media }) => ({ title: "Site Settings", media }),
  },
});
