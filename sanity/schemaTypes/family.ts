import { defineField, defineType } from "sanity";

// The "Family" section (shown on the home page): the two directors who share
// one wide photo, then the rest of the team each with their own photo.
export const familyType = defineType({
  name: "family",
  title: "Family",
  type: "document",
  fields: [
    defineField({
      name: "teamLead",
      title: "Directors (shared photo)",
      type: "object",
      description: "The two directors who share one wide headshot.",
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
      title: "Team members",
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
  preview: { prepare: () => ({ title: "Family" }) },
});
