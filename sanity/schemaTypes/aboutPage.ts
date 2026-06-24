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
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
