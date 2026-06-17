import { defineQuery } from "next-sanity";

// GROQ is Sanity's query language. These describe exactly which fields the
// front-end wants back from the Content Lake.

// All projects for the grid — ordered by a manual "order" number, then newest.
export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]
  | order(coalesce(order, 999) asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    location,
    category,
    mainImage
  }
`);

// How many published projects there are — shown as a superscript count.
export const PROJECT_COUNT_QUERY = defineQuery(`
  count(*[_type == "project" && defined(slug.current)])
`);

// Just the slugs — used to pre-build the detail pages.
export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]{ "slug": slug.current }
`);

// A single project by its slug, including the full gallery + description.
// lqip = a tiny base64 blur of the hero, used as an instant placeholder.
export const PROJECT_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    location,
    category,
    description,
    mainImage,
    "lqip": mainImage.asset->metadata.lqip,
    gallery
  }
`);
