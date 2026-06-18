// The LOWS DESIGN + BUILD lockup as a CSS mask, so it paints in `currentColor`.
// This lets the logo flip white / ink / red just by setting the text colour —
// no image swaps or filter hacks.
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Lows Design & Build"
      className={`block bg-current ${className}`}
      style={{
        maskImage: "url(/logotype.svg)",
        WebkitMaskImage: "url(/logotype.svg)",
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
