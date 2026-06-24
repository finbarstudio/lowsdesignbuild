"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

const EASE = "cubic-bezier(0.76,0,0.24,1)";

/**
 * A single team member. The whole card is a fixed height (image + name + role),
 * so there is zero layout shift. On hover the image masks up by exactly the
 * bio's height, the name + role lift by the same amount, and the bio reveals in
 * the freed space so its bottom lands precisely where the role's bottom sat.
 */
function Member({ m }: { m: TeamMember }) {
  const [hover, setHover] = useState(false);
  const [bioH, setBioH] = useState(0);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const measure = () => setBioH(bioRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [m.bio]);

  const hasBio = Boolean(m.bio);
  const lift = hasBio ? bioH : 0;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* image — masks up from the bottom by the bio's height on hover */}
      <div
        className="relative h-[44vh] overflow-hidden bg-background"
        style={{
          clipPath: hover ? `inset(0 0 ${lift}px 0)` : "inset(0 0 0 0)",
          transition: `clip-path 0.6s ${EASE}`,
        }}
      >
        <Image
          src={m.img}
          alt={m.name}
          fill
          loading="eager"
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover grayscale"
        />
      </div>

      {/* name + role — lift by the bio height on hover */}
      <div
        style={{
          transform: hover ? `translateY(-${lift}px)` : "translateY(0)",
          transition: `transform 0.6s ${EASE}`,
        }}
      >
        <p className="mt-4 text-base font-medium">{m.name}</p>
        <p className="text-sm text-muted">{m.role}</p>
      </div>

      {/* bio — pinned to the card bottom (so its bottom == the role's resting
          bottom); revealed on hover, sized to its own content */}
      {hasBio ? (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            opacity: hover ? 1 : 0,
            transition: `opacity 0.45s ease ${hover ? "0.12s" : "0s"}`,
          }}
        >
          <p
            ref={bioRef}
            className="pt-2 text-sm leading-relaxed text-muted"
          >
            {m.bio}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The team section: two directors sharing one wide headshot, then the rest of
 * the team as fixed-height cards with the hover-bio reveal.
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
      <div className="lg:col-span-1">
        <h2 className="label sticky top-24 !text-ink">{heading}</h2>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:col-span-2">
        {/* directors — one wide shared headshot */}
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
            <div key={m.name || i} className={lastAlone ? "sm:col-start-2" : ""}>
              <Member m={m} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
