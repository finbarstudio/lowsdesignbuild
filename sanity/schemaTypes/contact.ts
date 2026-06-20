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
      name: "formAccessKey",
      title: "Enquiry form access key (Web3Forms)",
      type: "string",
      description:
        "Paste a free Web3Forms access key to have the contact and estimate forms email you directly (with the calculator data) — no need for the visitor's mail app. Get one at web3forms.com using your inbox address. Leave blank to fall back to mailto.",
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
