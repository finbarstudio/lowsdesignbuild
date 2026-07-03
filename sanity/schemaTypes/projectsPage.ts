import { defineField, defineType } from "sanity";

// Editable copy for the Projects listing page. A single document — the grid
// itself comes from the Project documents.
export const projectsPageType = defineType({
  name: "projectsPage",
  title: "Projects Page",
  type: "document",
  fields: [
    defineField({
      name: "heroText",
      title: "Big heading",
      type: "string",
      description:
        "The large heading at the top of the Projects page. Leave blank to use the built-in text.",
    }),
    defineField({
      name: "heroIntro",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
      description:
        "The short paragraph under the heading. Leave blank to use the built-in text.",
    }),
  ],
  preview: { prepare: () => ({ title: "Projects Page" }) },
});
