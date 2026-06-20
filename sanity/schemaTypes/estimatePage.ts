import { defineField, defineType } from "sanity";

// Editable content for the Estimate page. For now: the explanation text behind
// each info (ⓘ) icon on the calculator. Each tip is keyed to a calculator field;
// blank tips fall back to the built-in copy.
const TIP_KEYS = [
  { value: "finish", title: "Finish level" },
  { value: "complexity", title: "Construction complexity" },
  { value: "steel", title: "Steel complexity" },
  { value: "opening", title: "Structural opening" },
  { value: "access", title: "Site access" },
  { value: "conservation", title: "Conservation area" },
  { value: "article4", title: "Article 4 restriction area" },
  { value: "ashp", title: "ASHP installation interface" },
  { value: "basement", title: "Basement interface / tie-in" },
  { value: "drainage", title: "Complex drainage diversion" },
  { value: "sewer", title: "Build over public sewer" },
  { value: "partyWall", title: "Party wall" },
];

export const estimatePageType = defineType({
  name: "estimatePage",
  title: "Estimate Page",
  type: "document",
  fields: [
    defineField({
      name: "infoTips",
      title: "Calculator info tooltips",
      type: "array",
      description:
        "The explanation shown when hovering the info icon next to a calculator field. Pick the field and write the help text.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "key",
              title: "Field",
              type: "string",
              options: { list: TIP_KEYS },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Tooltip text",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: { title: "key", subtitle: "text" },
            prepare: ({ title, subtitle }) => ({
              title: TIP_KEYS.find((t) => t.value === title)?.title ?? title,
              subtitle,
            }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Estimate Page" }) },
});
