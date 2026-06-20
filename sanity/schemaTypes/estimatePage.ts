import { defineField, defineType } from "sanity";

import { INFO_FIELDS as TIP_KEYS } from "@/app/lib/estimateInfoFields";

// Editable content for the Estimate page: the explanation text behind each info
// (ⓘ) icon on the calculator. A tooltip can be added to ANY calculator field —
// pick the field, write the text. Fields with built-in copy fall back to it.

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
