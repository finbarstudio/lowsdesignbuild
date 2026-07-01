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
      description:
        "The full-screen image at the very top of the home page. Ignored if a Hero video is set below.",
    }),
    defineField({
      name: "heroVideo",
      title: "Hero video (optional)",
      type: "file",
      options: { accept: "video/*" },
      description:
        "Upload an MP4/WebM to use a silent looping video instead of the hero image. Keep it under ~10 MB so the page stays fast. Leave empty to use the hero image.",
    }),
    defineField({
      name: "homeHeroText",
      title: "Big slogan",
      type: "string",
      description:
        "The large slogan that scrolls up over the home page, e.g. 'Family Run Construction Services in London and Surrounding Areas'.",
    }),
    defineField({
      name: "processSteps",
      title: "'Our process' steps",
      type: "array",
      description:
        "The numbered steps in the 'Our process' section on the HOME page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Step title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Step description",
              type: "text",
              rows: 3,
            }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        },
      ],
    }),
    defineField({
      name: "instagramFeedId",
      title: "Instagram live feed (Behold ID)",
      type: "string",
      description:
        "Paste your Behold.so feed ID to show a live, auto-updating Instagram feed. Leave blank to use the manual grid below instead.",
    }),
    defineField({
      name: "instagramPosts",
      title: "Instagram grid (fallback)",
      type: "array",
      description:
        "The Instagram grid on the home page (a 6×2 grid — up to 12 posts shown). Add a square photo for each post and the link to that post. Only used when no live feed ID is set above.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Post image",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
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
