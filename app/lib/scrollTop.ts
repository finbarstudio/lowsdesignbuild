// Smoothly scroll to the very top. Uses Lenis (home) for a slow, eased glide
// when present, otherwise the browser's native smooth scroll.
export function smoothScrollTop() {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } })
    .__lenis;
  if (lenis?.scrollTo) {
    lenis.scrollTo(0, { duration: 1.6 });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
