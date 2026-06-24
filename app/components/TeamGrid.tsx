"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  img: string;
};
export type TeamLead = {
  img: string;
  alt: string;
  people: { name: string | null; role: string | null; bio?: string | null }[];
};

const EASE = "cubic-bezier(0.76,0,0.24,1)";

/**
 * One person card. Fixed height (image + name + role) so there is zero layout
 * shift. When it opens (hover on desktop, or the mobile "Read bios" toggle) the
 * image masks up by exactly the bio's height, the name + role lift, and the bio
 * reveals so its bottom lands where the role's bottom sat. `objectPosition` lets
 * the two directors each show their half of one shared photo.
 */
function Member({
  m,
  active = false,
  objectPosition = "center",
  heightClass = "h-[50vh]",
}: {
  m: TeamMember;
  active?: boolean;
  objectPosition?: string;
  heightClass?: string;
}) {
  const [hover, setHover] = useState(false);
  const [bioH, setBioH] = useState(0);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const measure = () => setBioH(bioRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [m.bio]);

  const open = hover || active;
  const hasBio = Boolean(m.bio);
  const lift = hasBio ? bioH : 0;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`relative ${heightClass} overflow-hidden bg-background`}
        style={{
          clipPath: open ? `inset(0 0 ${lift}px 0)` : "inset(0 0 0 0)",
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
          style={{ objectPosition }}
        />
      </div>

      <div
        style={{
          transform: open ? `translateY(-${lift}px)` : "translateY(0)",
          transition: `transform 0.6s ${EASE}`,
        }}
      >
        <p className="mt-4 text-base font-medium">{m.name}</p>
        <p className="text-sm text-muted">{m.role}</p>
      </div>

      {hasBio ? (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            opacity: open ? 1 : 0,
            transition: `opacity 0.45s ease ${open ? "0.12s" : "0s"}`,
          }}
        >
          <p ref={bioRef} className="pt-2 text-sm leading-relaxed text-muted">
            {m.bio}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The team section: two directors sharing one wide photo — split into two
 * halves that each slide up to reveal that director's bio — then the rest of
 * the team as taller cards with the same hover-bio reveal. On mobile a "Read
 * bios" button opens all of them (no hover on touch).
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
  const [expanded, setExpanded] = useState(false);

  const directors = (teamLead.people ?? []).slice(0, 2).map((p) => ({
    name: p.name ?? "",
    role: p.role ?? "",
    bio: p.bio ?? "",
    img: teamLead.img,
  }));

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="label sticky top-24 !text-ink">{heading}</h2>
      </div>

      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
          {/* directors — one shared photo split into two halves */}
          {directors.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 sm:col-span-2">
              {directors.map((d, i) => (
                <Member
                  key={d.name || i}
                  m={d}
                  active={expanded}
                  objectPosition={i === 0 ? "left center" : "right center"}
                />
              ))}
            </div>
          ) : null}

          {team.map((m, i) => {
            const lastAlone = i === team.length - 1 && team.length % 2 === 1;
            return (
              <div
                key={m.name || i}
                className={lastAlone ? "sm:col-start-2" : ""}
              >
                <Member m={m} active={expanded} />
              </div>
            );
          })}
        </div>

        {/* mobile: open every bio (no hover on touch) */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="link link-underline is-tracked mt-10 sm:hidden"
        >
          {expanded ? "Hide bios" : "Read bios"}
        </button>
      </div>
    </div>
  );
}
