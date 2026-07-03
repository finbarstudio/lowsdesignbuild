import { defineField, defineType } from "sanity";

// A "Project" is one case study in the portfolio. This schema defines the
// fields the friend fills in inside the Studio. Add a field here and it
// instantly appears in the editing UI.
export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  // the older text-based type fields are grouped + collapsed so the UI stays
  // clean; they still drive the site wherever a project has no "Types" refs yet.
  fieldsets: [
    {
      name: "legacyTypes",
      title: "Older type fields (text)",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Keep it short — it's clamped to 2 lines on the cards and truncated with an ellipsis past that, so aim for roughly 30 characters / 4 words (be conservative). No need to include the place name (the location shows as its own pill). e.g. 'Loft Conversion & Rear Extension'.",
      validation: (rule) =>
        rule
          .required()
          .max(48)
          .warning("Long titles get truncated on the cards — try to keep it to ~30 characters."),
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
      name: "typeRefs",
      title: "Types",
      type: "array",
      of: [{ type: "reference", to: [{ type: "projectCategory" }] }],
      description:
        "What kind of work this project involved — pick up to two (e.g. Loft Conversion + Extension). Manage the full list of types under 'Project Types'; anything added there appears here automatically. Shown as pills and used by the projects-page filter.",
      validation: (rule) => rule.max(2).unique(),
    }),
    defineField({
      name: "categories",
      title: "Types (older text list)",
      type: "array",
      fieldset: "legacyTypes",
      of: [{ type: "string" }],
      description:
        "The previous way of tagging types. Still shown on the site when 'Types' above is empty. Prefer 'Types' above; you can clear this once switched over.",
      options: {
        list: [
          { title: "Loft Conversion", value: "Loft Conversion" },
          { title: "Extension", value: "Extension" },
          { title: "Refurbishment", value: "Refurbishment" },
          { title: "Roofing", value: "Roofing" },
        ],
        layout: "grid",
      },
      validation: (rule) => rule.max(2).unique(),
    }),
    defineField({
      name: "category",
      title: "Category (single, oldest)",
      type: "string",
      fieldset: "legacyTypes",
      description:
        "The oldest single-type field — still shown if the two fields above are empty.",
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
      name: "year",
      title: "Year completed",
      type: "number",
      description: "The year the project finished, e.g. 2025. Shown as a pill.",
      validation: (rule) => rule.min(1990).max(2100).integer(),
    }),
    defineField({
      name: "palette",
      title: "Colour palette",
      type: "array",
      validation: (rule) => rule.max(5),
      description:
        "Up to 5 colour tiles shown beside the project copy. Leave empty to auto-pull a palette from the hero image. Each tile reveals its name in mono type.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "color",
              title: "Colour (hex)",
              type: "string",
              description: "e.g. #5A5C4D",
              validation: (rule) =>
                rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
                  name: "hex colour",
                }),
            }),
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              description: "e.g. F&B Treron Satin",
            }),
          ],
          preview: { select: { title: "name", subtitle: "color" } },
        },
      ],
      options: { layout: "grid" },
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
