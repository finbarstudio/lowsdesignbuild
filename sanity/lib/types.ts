import type { SanityImageSource } from "@sanity/image-url";

// Hand-written shapes for what our GROQ queries return. Later we can replace
// these with auto-generated types via `sanity typegen` for full safety.

export interface ProjectListItem {
  _id: string;
  title: string | null;
  slug: string | null;
  location: string | null;
  category: string | null;
  year: number | null;
  palette?: Array<{ color: string | null; name: string | null }> | null;
  heroPalette?: SanityPalette | null;
  mainImage: SanityImageSource | null;
}

export interface SanitySwatch {
  background: string | null;
  foreground?: string | null;
  population?: number;
}

export interface SanityPalette {
  dominant?: SanitySwatch;
  vibrant?: SanitySwatch;
  lightVibrant?: SanitySwatch;
  darkVibrant?: SanitySwatch;
  muted?: SanitySwatch;
  lightMuted?: SanitySwatch;
  darkMuted?: SanitySwatch;
}

export interface Project extends ProjectListItem {
  description: string | null;
  year: number | null;
  palette: Array<{ _key?: string; color: string | null; name: string | null }> | null;
  heroPalette: SanityPalette | null;
  lqip: string | null;
  gallery: Array<SanityImageSource & { _key?: string }> | null;
}

export interface HomePage {
  heroImage: SanityImageSource | null;
  heroLqip: string | null;
  heroDim: { width: number; height: number } | null;
  heroVideoUrl: string | null;
  heroTrailImages: Array<SanityImageSource & { _key?: string }> | null;
  homeHeroText: string | null;
  featuredProjects: ProjectListItem[] | null;
  instagramFeedId: string | null;
  instagramPosts: Array<{
    _key?: string;
    url: string | null;
    image: SanityImageSource | null;
  }> | null;
}

export interface AboutPage {
  aboutHeroText: string | null;
  familyBio: string | null;
  processSteps: Array<{
    _key?: string;
    title: string | null;
    text: string | null;
  }> | null;
}

export interface Family {
  teamLead: {
    image: SanityImageSource | null;
    alt: string | null;
    people: Array<{ _key?: string; name: string | null; role: string | null }> | null;
  } | null;
  team: Array<{
    _key?: string;
    name: string | null;
    role: string | null;
    bio?: string | null;
    image: SanityImageSource | null;
  }> | null;
}

export interface Contact {
  contactEmail: string | null;
  formAccessKey: string | null;
  areas: string[] | null;
}

export interface EstimatePage {
  infoTips: Array<{
    _key?: string;
    key: string | null;
    text: string | null;
  }> | null;
}

export interface ServiceItem {
  _id: string;
  title: string | null;
  blurb: string | null;
  images: Array<SanityImageSource & { _key?: string }> | null;
}
