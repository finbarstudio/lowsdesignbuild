"use client";

import Image from "next/image";

import DropReveal from "@/app/components/DropReveal";
import WipeReveal from "@/app/components/WipeReveal";

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  img: string;
};
export type TeamLead = {
  img: string;
  alt: string;
  people: { name: string | null; role: string | null }[];
};

/**
 * The team section: two directors sharing one wide headshot, then the rest of
 * the team as individual cards. On hover a card's image crops up, the name/role
 * lift, and the (Sanity-editable) bio reveals out of a mask from the bottom,
 * sized to its content.
 */
export default function TeamGrid({
  teamLead,
  team,
  heading = "Team",
}: {
  teamLead: TeamLead;
  team: TeamMember[];
  heading?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      {/* left third: sticky title */}
      <div className="lg:col-span-1">
        <h2 className="label sticky top-24 !text-ink">{heading}</h2>
      </div>

      {/* right two-thirds: people */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:col-span-2">
        {/* the two directors, one wide headshot spanning both columns */}
        <div className="sm:col-span-2">
          <WipeReveal>
            <div className="relative aspect-[16/9] overflow-hidden bg-background">
              <Image
                src={teamLead.img}
                alt={teamLead.alt}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover grayscale"
              />
            </div>
          </WipeReveal>
          <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            {teamLead.people.map((pp, idx) => (
              <div key={pp.name ?? idx}>
                <DropReveal delay={250 + idx * 120}>
                  <p className="text-base font-medium">{pp.name}</p>
                </DropReveal>
                <DropReveal delay={250 + idx * 120 + 130}>
                  <p className="text-sm text-muted">{pp.role}</p>
                </DropReveal>
              </div>
            ))}
          </div>
        </div>

        {team.map((m, i) => {
          const lastAlone = i === team.length - 1 && team.length % 2 === 1;
          return (
            <div
              key={m.name || i}
              className={`group/m ${lastAlone ? "sm:col-start-2" : ""}`}
            >
              {/* image crops up on hover to make room */}
              <div className="relative aspect-[4/5] overflow-hidden bg-background [clip-path:inset(0_0_0_0)] transition-[clip-path] duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/m:[clip-path:inset(0_0_1.5rem_0)]">
                <Image
                  src={m.img}
                  alt={m.name}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover grayscale transition-transform duration-[700ms] ease-out group-hover/m:scale-[1.04]"
                />
              </div>
              {/* name + role lift; the bio reveals out of a mask below them,
                  measured to its own length */}
              <div className="transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/m:-translate-y-2">
                <p className="mt-4 text-base font-medium">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
                {m.bio ? (
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/m:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="max-w-prose pt-3 text-sm leading-relaxed text-muted">
                        {m.bio}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
