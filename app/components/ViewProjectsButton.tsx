import Link from "next/link";

/** Outline pill CTA linking to the projects page. */
export default function ViewProjectsButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Link
        href="/projects"
        className="inline-flex items-center rounded-full border border-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:bg-ink hover:text-background"
      >
        View projects
      </Link>
    </div>
  );
}
