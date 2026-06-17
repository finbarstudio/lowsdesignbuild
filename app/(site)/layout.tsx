import Footer from "@/app/components/Footer";
import Preloader from "@/app/components/Preloader";
import SmoothScroll from "@/app/components/SmoothScroll";

// Chrome shared by the home page + all marketing pages (never the Studio).
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      {children}
      <Footer />
    </>
  );
}
