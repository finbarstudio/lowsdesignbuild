import { defineField, defineType } from "sanity";

// A "Service" is one of the things Lows offers (Loft Conversions, Extensions…).
// It appears in the "What we do" section on the About page. Each service has
// its copy plus one or more example photos — the first is the thumbnail, and
// the rest cycle through on hover.
export const serviceType = defineType({
  name: "service",
  title: "Service",
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
      name: "images",
      title: "Example photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "The first photo is the thumbnail. Add more and they cycle on hover.",
      options: { layout: "grid" },
      validation: (rule) => rule.min(1).error("Add at least one photo."),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers show first. Leave blank to sort by newest.",
    }),
  ],
  preview: {
    select: { title: "title", media: "images.0" },
  },
});
