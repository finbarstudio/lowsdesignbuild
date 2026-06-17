import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Reveal from "@/app/components/Reveal";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import type { ProjectListItem } from "@/sanity/lib/types";

export const revalidate = 60;

const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Loft conversions, extensions and refurbishments across South London by Lows Design & Build.",
};

export default async function ProjectsPage() {
  const projects = await client.fetch<ProjectListItem[]>(PROJECTS_QUERY);

  return (
    <main>
      {/* Intro */}
      <section
        className={`${PAD} flex min-h-[60vh] flex-col justify-end pb-16 pt-36`}
      >
        <Reveal>
          <p className="label">Our work</p>
          <h1 className="serif mt-5 text-5xl sm:text-7xl">Projects</h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            A selection of recent loft conversions, extensions and full
            refurbishments across South London and Kent.
          </p>
        </Reveal>
      </section>

      {/* Grid */}
      <section className={`${PAD} py-16 sm:py-24`}>
        {projects.length === 0 ? (
          <div className="rounded-none border border-dashed border-line p-12 text-center">
            <p className="serif text-2xl">Projects coming soon</p>
            <p className="mt-3 text-sm text-muted">
              Add projects in the{" "}
              <Link href="/studio" className="underline hover:text-copper">
                Studio
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Reveal key={p._id}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative h-[64vw] overflow-hidden bg-line sm:h-[34vw] lg:h-[26rem]">
                    {p.mainImage && (
                      <Image
                        src={urlFor(p.mainImage)
                          .width(1000)
                          .height(1100)
                          .fit("crop")
                          .url()}
                        alt={p.title ?? ""}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="label">
                      {[p.category, p.location].filter(Boolean).join(" — ")}
                    </p>
                    <h2 className="serif mt-2 text-2xl">{p.title}</h2>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
