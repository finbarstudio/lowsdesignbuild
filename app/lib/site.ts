// Central site content. Later this moves into Sanity (siteSettings); for now
// it's the real copy/contact details pulled from the existing site.

// Single source of truth for the canonical origin. Set NEXT_PUBLIC_SITE_URL in
// the environment when the custom domain (lowsdesignandbuild.com) goes live.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lows-site.vercel.app";

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

export const services = [
  {
    title: "Loft Conversions",
    blurb:
      "Extend up into your unused loft space to maximise the potential of your home.",
    img: "/services/loft.jpg",
  },
  {
    title: "Extensions",
    blurb:
      "Open up your home and create a new space that can be tailored to your wants and needs.",
    img: "/services/extensions.jpg",
  },
  {
    title: "Renovations",
    blurb:
      "Update your home with a fresh new design. We help our clients design and build their dream spaces, adapting their existing properties to create something entirely new.",
    img: "/services/renovations.jpg",
  },
  {
    title: "Roofing",
    blurb:
      "Roofing services that ensure not only a water-tight building, but a design that works for our clients, using only the best quality materials.",
    img: "/services/roofing.jpg",
  },
  {
    title: "3D Visualisation",
    blurb:
      "A high-end 3D visualisation service to help clients understand their projects before they begin, so they can make the right design choices.",
    img: "/services/threed.jpg",
  },
  {
    title: "Architectural Services",
    blurb: "High-detail planning drawings for your planning-permission needs.",
    img: "/services/architectural.jpg",
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
  "Beckenham",
  "Bromley",
  "Chislehurst",
  "Dulwich",
  "West Wickham",
  "Orpington",
  "Streatham",
  "Sidcup",
  "Lewisham",
  "Sevenoaks",
];
