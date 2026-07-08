// Central site content. Later this moves into Sanity (siteSettings); for now
// it's the real copy/contact details pulled from the existing site.

// Single source of truth for the canonical origin. The custom domain is live —
// www is the canonical host (the apex 301s to it). NEXT_PUBLIC_SITE_URL still
// overrides for previews/staging.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lowsdesignandbuild.com";

// Per-page Open Graph block. Next.js replaces the layout's `openGraph` object
// wholesale when a page defines its own (top-level keys are shallow-merged),
// so pages use this helper to keep the shared fields while pointing
// og:title / og:url at the page itself.
export function ogFor(title: string, description: string, path: string) {
  return {
    title,
    description,
    url: path,
    type: "website" as const,
    locale: "en_GB",
    siteName: "Lows Design & Build",
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "Lows Design & Build" },
    ],
  };
}

export const site = {
  name: "Lows Design & Build",
  tagline: "Family-run design & build in South London",
  phone: "0208 176 2676",
  phoneHref: "tel:+442081762676",
  email: "info@lowsdesignandbuild.com",
  instagram: "https://www.instagram.com/lowsdesignandbuild/?hl=en",
  facebook: "https://m.facebook.com/lowsdesignandbuild",
  instagramHandle: "@lowsdesignandbuild",
};

export const nav = [
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Estimate", href: "/estimate" },
  { label: "Contact", href: "/contact" },
];

// The two directors share one wide headshot that spans both columns.
export const teamLead = {
  img: "/team/sam-james.jpg",
  alt: "Samuel and James Low",
  people: [
    { name: "Samuel Low", role: "Director" },
    { name: "James Low", role: "Director" },
  ],
};

export const team = [
  { name: "Patrick Low", role: "Project Manager", img: "/team/pat.jpg" },
  {
    name: "Shane (Honorary Low)",
    role: "Carpentry Specialist",
    img: "/team/shane.jpg",
  },
  {
    name: "Phil (Honorary Low)",
    role: "Roofing Specialist",
    img: "/team/phil.jpg",
  },
];

// `imgs` is an array so a service can show several example photos. On hover the
// first reveals, then it cycles through the rest with the same wipe.
export const services = [
  {
    title: "Loft Conversions",
    blurb:
      "Extend up into your unused loft space to maximise the potential of your home.",
    imgs: ["/services/loft.jpg"],
  },
  {
    title: "Extensions",
    blurb:
      "Open up your home and create a new space that can be tailored to your wants and needs.",
    imgs: ["/services/extensions.jpg"],
  },
  {
    title: "Renovations",
    blurb:
      "Update your home with a fresh new design. We help our clients design and build their dream spaces, adapting their existing properties to create something entirely new.",
    imgs: ["/services/renovations.jpg"],
  },
  {
    title: "Roofing",
    blurb:
      "Roofing services that ensure not only a water-tight building, but a design that works for our clients, using only the best quality materials.",
    imgs: ["/services/roofing.jpg"],
  },
  {
    title: "3D Visualisation",
    blurb:
      "A high-end 3D visualisation service to help clients understand their projects before they begin, so they can make the right design choices.",
    imgs: ["/services/threed.jpg"],
  },
  {
    title: "Architectural Services",
    blurb: "High-detail planning drawings for your planning-permission needs.",
    imgs: ["/services/architectural.jpg"],
  },
];

export const processSteps = [
  {
    n: "01",
    title: "Consultation",
    text: "We meet to discuss your project and provide a free, no-obligation estimate for the works.",
  },
  {
    n: "02",
    title: "Architectural Services",
    text: "We provide all the architectural and engineering drawings, and handle local authorities and building control.",
  },
  {
    n: "03",
    title: "Construction",
    text: "Our team undertakes all the building works start to finish, communicating with you throughout.",
  },
  {
    n: "04",
    title: "The Finishing Touches",
    text: "We go above and beyond to make sure the final finish is of a very high quality.",
  },
];

export const areas = [
  "South London",
  "North London",
  "East London",
  "West London",
  "Greater London",
  "Kent",
  "Essex",
];
