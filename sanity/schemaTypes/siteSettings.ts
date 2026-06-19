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
    defineField({
      name: "heroTrailImages",
      title: "Hero text trail images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "Images that trail the cursor when hovering the big slogan on the home page. Add a handful of project photos.",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact form recipient email",
      type: "string",
      description:
        "Where the contact / enquiry form sends to. Leave blank to use the default.",
    }),
    defineField({
      name: "areas",
      title: "Areas we cover",
      type: "array",
      of: [{ type: "string" }],
      description:
        "The locations shown as pills on the Contact and About pages. Used everywhere areas appear.",
      options: { layout: "tags" },
    }),
    defineField({
      name: "homeHeroText",
      title: "Home — big slogan",
      type: "string",
      description: "The large slogan that scrolls in on the home page.",
    }),
    defineField({
      name: "aboutHeroText",
      title: "About — big heading",
      type: "string",
      description: "The large heading at the top of the About page.",
    }),
    defineField({
      name: "familyBio",
      title: "About — 'A family company' bio",
      type: "text",
      rows: 8,
      description:
        "The feature bio on the About page. Separate paragraphs with a blank line.",
    }),
    defineField({
      name: "processSteps",
      title: "Our process — steps",
      type: "array",
      description: "The numbered steps in the 'Our process' pathway.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "text", title: "Description", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        },
      ],
    }),
    defineField({
      name: "teamLead",
      title: "Family — directors (shared photo)",
      type: "object",
      description:
        "The two directors who share one wide headshot at the top of the Family section.",
      fields: [
        defineField({
          name: "image",
          title: "Shared photo",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({ name: "alt", title: "Photo description", type: "string" }),
        defineField({
          name: "people",
          title: "People",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "name", title: "Name", type: "string" }),
                defineField({ name: "role", title: "Role", type: "string" }),
              ],
              preview: { select: { title: "name", subtitle: "role" } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "team",
      title: "Family — team members",
      type: "array",
      description: "The rest of the team, each with their own photo.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: "name", subtitle: "role", media: "image" } },
        },
      ],
    }),
  ],
  preview: {
    select: { media: "heroImage" },
    prepare: ({ media }) => ({ title: "Site Settings", media }),
  },
});
