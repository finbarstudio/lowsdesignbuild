// The LOWS house mark as a CSS mask, so it paints in `currentColor` (matching
// the Wordmark). viewBox 121.43 × 86.64.
export default function Logomark({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Lows"
      className={`block bg-current ${className}`}
      style={{
        maskImage: "url(/logomark.svg)",
        WebkitMaskImage: "url(/logomark.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}
