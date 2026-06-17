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
