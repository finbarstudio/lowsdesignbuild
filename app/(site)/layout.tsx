import CustomCursor from "@/app/components/CustomCursor";
import Footer from "@/app/components/Footer";
import Preloader from "@/app/components/Preloader";
import ScrollHint from "@/app/components/ScrollHint";
import SmoothScroll from "@/app/components/SmoothScroll";
import { areas, services, site, siteUrl } from "@/app/lib/site";

const BASE = siteUrl;

// LocalBusiness structured data for rich results / local SEO.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${BASE}/#business`,
  name: site.name,
  description:
    "Family-run design and build company in South London. Loft conversions, house extensions and refurbishments, from design through to completion.",
  url: BASE,
  image: `${BASE}/og.jpg`,
  logo: `${BASE}/logotype.svg`,
  telephone: site.phoneHref.replace("tel:", ""),
  email: site.email,
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    addressRegion: "South London",
    addressCountry: "GB",
  },
  areaServed: areas.map((a) => ({ "@type": "City", name: a })),
  makesOffer: services.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.title },
  })),
  sameAs: [site.instagram],
};

// Chrome shared by the home page + all marketing pages (never the Studio).
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        // escape "<" so no value could ever break out of the <script> tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Preloader />
      <SmoothScroll />
      <CustomCursor />
      {/* mobile-only subtle scroll indicator, bottom-right of every hero */}
      <ScrollHint />
      {children}
      <Footer />
    </>
  );
}
