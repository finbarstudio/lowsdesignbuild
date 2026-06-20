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

// Home page. heroLqip is the tiny base64 blur Sanity generates for the hero
// image — used as an instant placeholder while the full image loads.
export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    heroImage,
    "heroLqip": heroImage.asset->metadata.lqip,
    "heroDim": heroImage.asset->metadata.dimensions,
    heroTrailImages,
    homeHeroText,
    instagramFeedId,
    instagramPosts[]{ url, image }
  }
`);

// About page copy + process steps.
export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_type == "aboutPage"][0]{
    aboutHeroText,
    familyBio,
    processSteps
  }
`);

// The Family section (directors + team).
export const FAMILY_QUERY = defineQuery(`
  *[_type == "family"][0]{
    teamLead,
    team
  }
`);

// Contact details — form recipient + the areas pill list (shared with About).
export const CONTACT_QUERY = defineQuery(`
  *[_type == "contact"][0]{
    contactEmail,
    areas
  }
`);

// The services shown in "What we do" on the About page — ordered manually.
export const SERVICES_QUERY = defineQuery(`
  *[_type == "service"]
  | order(coalesce(order, 999) asc, _createdAt desc) {
    _id,
    title,
    blurb,
    images
  }
`);
