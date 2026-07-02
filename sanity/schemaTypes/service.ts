import { defineField, defineType } from "sanity";

// A "Service" is one of the things Lows offers (Loft Conversions, Extensions…).
// It appears in the "What we do" masonry on the About page — one photo per
// service, filling its card with the title over a dark gradient at the bottom.
export const serviceType = defineType({
  name: "service",
  title: "What we do",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. Loft Conversions",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "blurb",
      title: "Description",
      type: "text",
      rows: 3,
      description: "A sentence or two describing this service.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description:
        "One photo for this service. It fills the card; the title sits over a dark gradient along the bottom. Set the hotspot so the important part stays centred when the card is cropped.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers show first. Leave blank to sort by newest.",
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
  },
});
