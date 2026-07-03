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
    categories,
    "typeTitles": typeRefs[]->title,
    "typeTitles": typeRefs[]->title,
    year,
    palette,
    "heroPalette": mainImage.asset->metadata.palette,
    "lqip": mainImage.asset->metadata.lqip,
    mainImage
  }
`);

// A few project hero images (mainImage) for the "View projects" button's photo
// fan — same ordering as the grid, so it features the lead projects and tracks
// the CMS automatically.
export const PROJECT_THUMBS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current) && defined(mainImage)]
  | order(coalesce(order, 999) asc, _createdAt desc) [0...3] {
    _id,
    title,
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
    categories,
    year,
    description,
    palette,
    "heroPalette": mainImage.asset->metadata.palette,
    mainImage,
    "lqip": mainImage.asset->metadata.lqip,
    gallery[]{ ..., "lqip": asset->metadata.lqip }
  }
`);

// Home page. heroLqip is the tiny base64 blur Sanity generates for the hero
// image — used as an instant placeholder while the full image loads.
export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    heroImage,
    "heroLqip": heroImage.asset->metadata.lqip,
    "heroDim": heroImage.asset->metadata.dimensions,
    "heroVideoUrl": heroVideo.asset->url,
    homeHeroText,
    processSteps,
    instagramFeedId,
    instagramPosts[]{ url, image }
  }
`);

// About page copy.
export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_type == "aboutPage"][0]{
    aboutHeroText,
    familyBio,
    qualityTitle,
    qualityText
  }
`);

// The Team section (directors + team).
export const FAMILY_QUERY = defineQuery(`
  *[_type == "family"][0]{
    teamLead,
    team[]{ name, role, bio, image }
  }
`);

// Estimate page — the editable info-tooltip copy for the calculator.
export const ESTIMATE_PAGE_QUERY = defineQuery(`
  *[_type == "estimatePage"][0]{
    heroText,
    heroIntro,
    infoTips[]{ key, text }
  }
`);

// Contact details — form recipient + the areas pill list (shared with About).
export const CONTACT_QUERY = defineQuery(`
  *[_type == "contact"][0]{
    contactHeroText,
    contactEmail,
    formAccessKey,
    calendlyUrl,
    areas
  }
`);

// The services shown in "What we do" on the About page — ordered manually.
// One image per service; lqip is a tiny blur placeholder for the card.
export const SERVICES_QUERY = defineQuery(`
  *[_type == "service"]
  | order(coalesce(order, 999) asc, _createdAt desc) {
    _id,
    title,
    blurb,
    image,
    "lqip": image.asset->metadata.lqip,
    "aspect": image.asset->metadata.dimensions.aspectRatio
  }
`);

// Projects listing page copy — heading + intro (grid comes from the projects).
export const PROJECTS_PAGE_QUERY = defineQuery(`
  *[_type == "projectsPage"][0]{
    heroText,
    heroIntro
  }
`);
