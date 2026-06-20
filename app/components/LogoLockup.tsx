import Logomark from "@/app/components/Logomark";
import Wordmark from "@/app/components/Wordmark";

// The full logo lockup — house mark + wordmark, side by side — as used in the
// nav bar across the site. Paints in currentColor.
export default function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Logomark className="h-[26px] w-[37px]" />
      <Wordmark className="h-[26px] w-[57px]" />
    </span>
  );
}
