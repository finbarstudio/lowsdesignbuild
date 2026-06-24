import Logomark from "@/app/components/Logomark";

// Shown instantly while a project page loads — so a click always has immediate
// feedback even though the detail page fetches and is image-heavy.
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background">
      <Logomark className="h-12 w-[68px] animate-pulse text-ink/60" />
    </div>
  );
}
