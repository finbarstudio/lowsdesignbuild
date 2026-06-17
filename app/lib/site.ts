// Central site content. Later this moves into Sanity (siteSettings); for now
// it's the real copy/contact details pulled from the existing site.

export const site = {
  name: "Lows Design & Build",
  tagline: "Family-run design & build in South London",
  phone: "0208 176 2676",
  phoneHref: "tel:+442081762676",
  email: "info@lowsdesignandbuild.com",
  instagram: "https://www.instagram.com/lowsdesignandbuild/",
  instagramHandle: "@lowsdesignandbuild",
};

export const nav = [
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Estimate", href: "/estimate" },
  { label: "Contact", href: "/contact" },
];

export const team = [
  { name: "Pat", img: "/team/pat.jpg" },
  { name: "Shane", img: "/team/shane.jpg" },
  { name: "Phil", img: "/team/phil.jpg" },
];

export const services = [
  {
    title: "Loft Conversions",
    blurb:
      "Dormers, hip-to-gable and Velux conversions that turn unused roof space into light-filled bedrooms, studies and bathrooms.",
  },
  {
    title: "Extensions",
    blurb:
      "Single and double-storey rear, side and wrap-around extensions that add space and light and are built to last.",
  },
  {
    title: "Refurbishments",
    blurb:
      "Full and partial renovations: kitchens, bathrooms, and whole-home transformations finished to a very high standard.",
  },
  {
    title: "Architectural Works",
    blurb:
      "All the drawings a project needs, plus we handle communication with local authorities and building control.",
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
