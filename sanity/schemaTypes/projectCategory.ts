import { defineField, defineType } from "sanity";

// A "Project Type" — a managed tag the client controls (Loft Conversion,
// Extension, Windows, Bathrooms…). Add one here and it becomes selectable on
// every project (under "Types") and, once at least one project uses it, appears
// as a filter button on the Projects page. No developer needed to add new types.
export const projectCategoryType = defineType({
  name: "projectCategory",
  title: "Project Type",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Name",
      type: "string",
      description:
        "The type as it appears as a pill and a filter button, e.g. 'Loft Conversion', 'Windows'.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description:
        "Lower numbers show first in the filter. Leave blank to sort alphabetically.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "order" },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle != null ? `Order: ${subtitle}` : undefined,
    }),
  },
});
