import type { SanityImageSource } from "@sanity/image-url";

// Hand-written shapes for what our GROQ queries return. Later we can replace
// these with auto-generated types via `sanity typegen` for full safety.

export interface ProjectListItem {
  _id: string;
  title: string | null;
  slug: string | null;
  location: string | null;
  category: string | null;
  mainImage: SanityImageSource | null;
}

export interface Project extends ProjectListItem {
  description: string | null;
  lqip: string | null;
  gallery: Array<SanityImageSource & { _key?: string }> | null;
}

export interface SiteSettings {
  heroImage: SanityImageSource | null;
  heroLqip: string | null;
  heroDim: { width: number; height: number } | null;
  heroTrailImages: Array<SanityImageSource & { _key?: string }> | null;
  areas: string[] | null;
  homeHeroText: string | null;
  aboutHeroText: string | null;
  familyBio: string | null;
  processSteps: Array<{
    _key?: string;
    title: string | null;
    text: string | null;
  }> | null;
  teamLead: {
    image: SanityImageSource | null;
    alt: string | null;
    people: Array<{ _key?: string; name: string | null; role: string | null }> | null;
  } | null;
  team: Array<{
    _key?: string;
    name: string | null;
    role: string | null;
    image: SanityImageSource | null;
  }> | null;
}

export interface ServiceItem {
  _id: string;
  title: string | null;
  blurb: string | null;
  images: Array<SanityImageSource & { _key?: string }> | null;
}
