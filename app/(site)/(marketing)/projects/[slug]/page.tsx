import { FOOT, PAD } from "@/app/lib/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import HeroDepth from "@/app/components/HeroDepth";
import ProjectAside from "@/app/components/ProjectAside";
import ProjectGallery from "@/app/components/ProjectGallery";
import ProjectHeroTitle from "@/app/components/ProjectHeroTitle";
import Reveal from "@/app/components/Reveal";
import { deriveColours } from "@/app/lib/colours";
import { projectCats } from "@/app/lib/projectCats";
import { client } from "@/sanity/lib/client";
import { urlFor, urlForOriginal } from "@/sanity/lib/image";
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
    : `${projectCats(project)[0] ?? "Building"} project in ${project.location ?? "South London"}.`;
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch<Project | null>(PROJECT_QUERY, { slug });
  if (!project) notFound();

  // Descriptive, non-empty alt for SEO + screen readers.
  const heroAlt = [project.title, ...projectCats(project), project.location]
    .filter(Boolean)
    .join(", ");

  const gallery = project.gallery ?? [];

  return (
    <main>
      {/* the h1 itself travels up into the nav as you scroll */}
      <ProjectHeroTitle title={project.title ?? ""} />

      {/* ---------------- Hero ---------------- */}
      {/* Sticky: it holds full-height while the content below scrolls up over
          it, and the image falls away (recede + fade) as it goes. */}
      <section
        id="project-hero"
        className="sticky top-0 z-0 h-[80svh] w-full overflow-hidden"
      >
        {project.mainImage && (
          <Image
            id="project-hero-img"
            src={urlFor(project.mainImage).width(2400).height(1600).fit("crop").url()}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            placeholder={project.lqip ? "blur" : undefined}
            blurDataURL={project.lqip ?? undefined}
            style={{ transform: "scale(1.34)", willChange: "transform, opacity" }}
            className="object-cover"
          />
        )}
        <HeroDepth targetId="project-hero-img" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
      </section>

      {/* everything below scrolls up over the pinned hero */}
      <div className="relative z-10 bg-background">

      {/* ---------------- Intro statement ---------------- */}
      {project.description && (
        <section className={`${PAD} py-16 sm:py-28 lg:py-40`}>
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-10">
            {/* left rail: tags + colour tiles, both mask-revealing */}
            <div className="lg:col-span-4">
              <ProjectAside
                tags={[...projectCats(project), project.location, project.year]
                  .filter(Boolean)
                  .map(String)}
                colours={deriveColours(project.palette, project.heroPalette)}
              />
            </div>
            <Reveal className="lg:col-span-7 lg:col-start-6">
              <p className="serif text-xl leading-[1.3] sm:text-2xl lg:text-3xl">
                {project.description}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------- Gallery ---------------- */}
      {/* Uniform 2-up grid; click any tile for a full-size, click-through
          lightbox (the original asset, contained to the viewport). */}
      {gallery.length > 0 && (
        <section className={`${PAD} pb-28 sm:pb-40`}>
          <ProjectGallery
            images={gallery.map((img) => ({
              thumb: urlFor(img).width(1400).height(1400).fit("crop").url(),
              // a fast low-res of the FULL image (same aspect) shown instantly in
              // the lightbox while the original loads — so it's never blank.
              low: urlFor(img).width(640).quality(35).url(),
              // original asset — full native resolution, no crop, no re-encode
              full: urlForOriginal(img).url(),
              lqip: (img as { lqip?: string }).lqip,
            }))}
            alt={heroAlt}
          />
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      <section>
        <div className={`${PAD} ${FOOT} pt-24 text-center sm:pt-32`}>
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
      </div>
    </main>
  );
}
