import { PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Reveal from "@/app/components/Reveal";
import WordReveal from "@/app/components/WordReveal";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY } from "@/sanity/lib/queries";
import type { Project } from "@/sanity/lib/types";

export const revalidate = 60;


export async function generateStaticParams() {
  const slugs = await client.fetch<Array<{ slug: string | null }>>(
    PROJECT_SLUGS_QUERY,
  );
  return slugs
    .filter((s): s is { slug: string } => Boolean(s.slug))
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await client.fetch<Project | null>(PROJECT_QUERY, { slug });
  if (!project) return { title: "Project" };
  const description = project.description
    ? project.description.slice(0, 155).replace(/\s+\S*$/, "")
    : `${project.category ?? "Building"} project in ${project.location ?? "South London"}.`;
  const ogImage = project.mainImage
    ? urlFor(project.mainImage).width(1200).height(630).fit("crop").url()
    : undefined;
  return {
    title: project.title ?? "Project",
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title ?? "Project",
      description,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
  };
}

// Asymmetric gallery: alternating two-up rows and offset single images.
const ROW_PATTERN = [2, 1, 2, 1, 2, 1, 2];

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch<Project | null>(PROJECT_QUERY, { slug });
  if (!project) notFound();

  // Descriptive, non-empty alt for SEO + screen readers.
  const heroAlt = [project.title, project.category, project.location]
    .filter(Boolean)
    .join(", ");

  const gallery = project.gallery ?? [];
  const rows: { imgs: typeof gallery; size: number; i: number }[] = [];
  let idx = 0;
  let pi = 0;
  while (idx < gallery.length) {
    const size = ROW_PATTERN[pi % ROW_PATTERN.length];
    rows.push({ imgs: gallery.slice(idx, idx + size), size, i: pi });
    idx += size;
    pi++;
  }

  return (
    <main>
      {/* ---------------- Hero ---------------- */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        {project.mainImage && (
          <Image
            src={urlFor(project.mainImage).width(2400).height(1600).fit("crop").url()}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            placeholder={project.lqip ? "blur" : undefined}
            blurDataURL={project.lqip ?? undefined}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
        <div className={`absolute inset-x-0 bottom-0 ${PAD} pb-8`}>
          <h1 className="serif text-4xl text-white sm:text-6xl lg:text-7xl">
            <WordReveal text={project.title ?? ""} />
          </h1>
        </div>
      </section>

      {/* ---------------- Intro statement ---------------- */}
      {project.description && (
        <section className={`${PAD} py-16 sm:py-28 lg:py-40`}>
          <Reveal>
            <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-6">
              {/* type / location / year as pills, to the left of the bio */}
              <div className="flex flex-wrap gap-2 lg:col-span-3 lg:flex-col lg:items-start">
                {[project.category, project.location, project.year]
                  .filter(Boolean)
                  .map((t) => (
                    <span key={String(t)} className="pill text-ink">
                      {t}
                    </span>
                  ))}
              </div>
              <p className="serif text-xl leading-[1.3] sm:text-2xl lg:col-span-8 lg:col-start-4 lg:text-3xl">
                {project.description}
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------------- Gallery ---------------- */}
      {gallery.length > 0 && (
        <section className={`${PAD} pb-28 sm:pb-40`}>
          <div className="space-y-4 sm:space-y-6">
            {rows.map((row) => {
              if (row.size === 1) {
                // single offset image with whitespace
                const left = row.i % 4 === 1;
                return (
                  <Reveal key={row.i}>
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      <div
                        className={
                          left
                            ? "lg:col-span-6 lg:col-start-1"
                            : "lg:col-span-6 lg:col-start-7"
                        }
                      >
                        <GalleryImage
                          img={row.imgs[0]}
                          ratio="aspect-[4/3]"
                          alt={heroAlt}
                        />
                      </div>
                    </div>
                  </Reveal>
                );
              }
              // two-up, differing widths/heights
              const wideLeft = row.i % 4 === 0;
              return (
                <Reveal key={row.i}>
                  <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6">
                    <GalleryImage
                      img={row.imgs[0]}
                      ratio={wideLeft ? "aspect-[5/4]" : "aspect-[3/4]"}
                      alt={heroAlt}
                    />
                    {row.imgs[1] && (
                      <GalleryImage
                        img={row.imgs[1]}
                        ratio={wideLeft ? "aspect-[3/4]" : "aspect-[5/4]"}
                        alt={heroAlt}
                      />
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      <section>
        <div className={`${PAD} py-24 text-center sm:py-32`}>
          <h2 className="serif text-3xl sm:text-5xl">
            Planning something similar?
          </h2>
          <Link
            href="/contact"
            className="link link-underline is-tracked mt-7 inline-block"
          >
            Start your project
          </Link>
        </div>
      </section>
    </main>
  );
}

function GalleryImage({
  img,
  ratio,
  alt,
}: {
  img: NonNullable<Project["gallery"]>[number];
  ratio: string;
  alt: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-line ${ratio}`}>
      <Image
        src={urlFor(img).width(1400).height(1400).fit("crop").url()}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
