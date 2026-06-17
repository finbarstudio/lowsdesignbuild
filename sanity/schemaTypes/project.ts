import { defineField, defineType } from "sanity";

// A "Project" is one case study in the portfolio. This schema defines the
// fields the friend fills in inside the Studio. Add a field here and it
// instantly appears in the editing UI.
export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. Beckenham – Loft Conversion & Rear Extension",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: 'The web address, generated from the title. Click "Generate".',
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Area / town, e.g. Beckenham",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Loft Conversion", value: "Loft Conversion" },
          { title: "Extension", value: "Extension" },
          { title: "Refurbishment", value: "Refurbishment" },
          { title: "Roofing", value: "Roofing" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      description: "The cover photo shown in the grid.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers show first. Leave blank to sort by newest.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "location", media: "mainImage" },
  },
});
