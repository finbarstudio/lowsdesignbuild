import { defineField, defineType } from "sanity";

// Everything editable on the About page. A single document.
// ("What we do" services live in their own list; "Where we work" areas live
//  under Contact, since they're shared with the contact page.)
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
        "The feature bio on the About page. Separate paragraphs with a blank line.",
    }),
    defineField({
      name: "processSteps",
      title: "'Our process' steps",
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
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
