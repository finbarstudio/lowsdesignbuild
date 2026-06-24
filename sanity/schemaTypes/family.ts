import { defineField, defineType } from "sanity";

// The "Team" section (shown on the About page): the two directors who share one
// wide photo, then the rest of the team each with their own photo + hover bio.
// (Internal type name stays "family" so existing content isn't lost.)
export const familyType = defineType({
  name: "family",
  title: "Team",
  type: "document",
  fields: [
    defineField({
      name: "teamLead",
      title: "Directors (shared photo)",
      type: "object",
      description:
        "The two directors who share one wide headshot at the top of the Team section.",
      fields: [
        defineField({
          name: "image",
          title: "Shared photo",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "alt",
          title: "Photo description",
          type: "string",
          description: "A short description of the photo (for accessibility).",
        }),
        defineField({
          name: "people",
          title: "People",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "name",
                  title: "Name",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "role", title: "Role", type: "string" }),
                defineField({
                  name: "bio",
                  title: "Short bio",
                  type: "text",
                  rows: 3,
                  description:
                    "Revealed when their half of the shared photo slides up. Keep it under 400 characters.",
                  validation: (rule) => rule.max(400),
                }),
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
      description:
        "The rest of the team, each with their own photo. On hover their bio reveals.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              // required so a member card can never render without a photo
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "bio",
              title: "Short bio",
              type: "text",
              rows: 3,
              description:
                "Revealed on hover (desktop). Keep it under 400 characters so it fits the card.",
              validation: (rule) => rule.max(400),
            }),
          ],
          preview: { select: { title: "name", subtitle: "role", media: "image" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Team" }) },
});
