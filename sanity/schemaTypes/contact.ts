import { defineField, defineType } from "sanity";

// Contact details shared across the site: where the enquiry form sends, and the
// "Areas we cover" / "Where we work" pill list (used on Contact and About).
export const contactType = defineType({
  name: "contact",
  title: "Contact",
  type: "document",
  fields: [
    defineField({
      name: "contactEmail",
      title: "Enquiry form recipient email",
      type: "string",
      description:
        "Where the contact / enquiry form sends to. Leave blank to use the default.",
    }),
    defineField({
      name: "areas",
      title: "Areas we cover",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "The locations shown as pills on the Contact page ('Areas we cover') and About page ('Where we work').",
    }),
  ],
  preview: { prepare: () => ({ title: "Contact" }) },
});
