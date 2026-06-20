import { defineField, defineType } from "sanity";

// Everything editable on the Home page. A single document (one Home page).
export const homePageType = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      description: "The large image at the top of the home page.",
    }),
    defineField({
      name: "homeHeroText",
      title: "Big slogan",
      type: "string",
      description:
        "The large slogan that scrolls in over the home page (the 'Family run…' line).",
    }),
    defineField({
      name: "heroTrailImages",
      title: "Slogan trail images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "Images that trail the cursor when hovering the big slogan. A handful of project photos.",
      options: { layout: "grid" },
    }),
    defineField({
      name: "instagramPosts",
      title: "Instagram strip",
      type: "array",
      description:
        "The scrolling Instagram band on the home page. Add a square photo for each post and the link to that post.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Post image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "url",
              title: "Link to the post",
              type: "url",
              description: "e.g. https://www.instagram.com/p/XXXX/",
            }),
          ],
          preview: { select: { media: "image", title: "url" } },
        },
      ],
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { media: "heroImage" },
    prepare: ({ media }) => ({ title: "Home Page", media }),
  },
});
