import { defineField, defineType } from "sanity";

// Everything editable on the About page. A single document.
// Note: other About-page sections live in their own places —
//  • 'What we do'    → the "What we do" list
//  • 'Team'          → the "Team" document
//  • 'Where we work' → the areas under "Contact"
export const aboutPageType = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "aboutHeroText",
      title: "Big heading",
      type: "string",
      description: "The large heading at the top of the About page.",
    }),
    defineField({
      name: "familyBio",
      title: "'A family company' bio",
      type: "text",
      rows: 8,
      description:
        "The feature bio on the About page (the text that lights up word-by-word as you scroll). Separate paragraphs with a blank line.",
    }),
    defineField({
      name: "qualityTitle",
      title: "'Quality guarantee' small heading",
      type: "string",
      description:
        "The small gold heading of the closing section. Leave blank to use the built-in text.",
    }),
    defineField({
      name: "qualityText",
      title: "'Quality guarantee' statement",
      type: "text",
      rows: 5,
      description:
        "The large closing statement on the About page. Leave blank to use the built-in text.",
    }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
