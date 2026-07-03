"use client";

/* eslint-disable @next/next/no-img-element */
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
const RISE = "cubic-bezier(0.22,1,0.36,1)";

// reveal once the element scrolls into view (scroll listener, not IO)
function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    let raf = 0;
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
        setInView(true);
        cleanup();
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cleanup();
      cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, inView];
}

/**
 * One person card. Fixed height (image + name + role) = zero layout shift. It
 * mask-reveals (image rises, text lifts) when it scrolls in. When it opens
 * (hover, or the mobile "Read bios" toggle) the image masks up by the bio's
 * height, the name + role lift, and the bio reveals so its bottom lands where
 * the role's bottom sat.
 */
function Member({ m, delay = 0 }: { m: TeamMember; delay?: number }) {
  const [cardRef, inView] = useInView();
  const [hover, setHover] = useState(false);
  const [tapped, setTapped] = useState(false); // mobile tap-to-open
  const [bioH, setBioH] = useState(0);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const measure = () => setBioH(bioRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [m.bio]);

  const open = hover || tapped;
  const lift = m.bio ? bioH : 0;

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {m.bio ? (
        <button
          type="button"
          onClick={() => setTapped((v) => !v)}
          aria-label={tapped ? `Hide ${m.name}'s bio` : `Read ${m.name}'s bio`}
          className="absolute right-3 top-3 z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-background/90 font-mono text-lg leading-none text-ink shadow-sm [@media(hover:none)]:flex"
        >
          {tapped ? "–" : "+"}
        </button>
      ) : null}
      <div
        className="relative h-[50vh] overflow-hidden bg-background"
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
          style={{
            transform: inView ? "translateY(0)" : "translateY(101%)",
            transition: `transform 0.9s ${RISE} ${delay}ms`,
          }}
        />
      </div>

      <div
        style={{
          transform: open ? `translateY(-${lift}px)` : "translateY(0)",
          opacity: inView ? 1 : 0,
          transition: `transform 0.6s ${EASE}, opacity 0.6s ease ${delay + 120}ms`,
        }}
      >
        <p className="mt-4 text-base font-medium">{m.name}</p>
        <p className="text-sm text-muted">{m.role}</p>
      </div>

      {m.bio ? (
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
 * The two directors share one wide photo, split seamlessly down the middle (each
 * half shows exactly its 50% via a 200%-wide image anchored left/right, no gap).
 * Hovering either half (or the mobile toggle) opens BOTH at once: both halves
 * mask up by the same amount and both bios reveal together, each under the
 * correct director.
 */
function DirectorsPair({
  directors,
  img,
}: {
  directors: TeamMember[];
  img: string;
}) {
  const [cardRef, inView] = useInView();
  const [hover, setHover] = useState(false);
  const [tapped, setTapped] = useState(false); // mobile tap-to-open (both halves)
  const [isMobile, setIsMobile] = useState(false);
  const bio0 = useRef<HTMLParagraphElement>(null);
  const bio1 = useRef<HTMLParagraphElement>(null);
  const [bioH, setBioH] = useState(0);

  useEffect(() => {
    const measure = () =>
      setBioH(
        Math.max(bio0.current?.offsetHeight ?? 0, bio1.current?.offsetHeight ?? 0),
      );
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [directors]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const open = hover || tapped;
  const hasBios = directors.some((d) => d.bio);
  // On mobile the images stay a joined 2-up and DON'T clip — the bios stack
  // single-column below instead (see the mobile block after the grid).
  const lift = !isMobile && open ? bioH : 0;

  return (
    <div
      ref={cardRef}
      className="relative sm:col-span-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hasBios ? (
        <button
          type="button"
          onClick={() => setTapped((v) => !v)}
          aria-label={tapped ? "Hide directors' bios" : "Read directors' bios"}
          className="absolute right-3 top-3 z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-background/90 font-mono text-lg leading-none text-ink shadow-sm [@media(hover:none)]:flex"
        >
          {tapped ? "–" : "+"}
        </button>
      ) : null}
      <div className="grid grid-cols-2">
        {directors.map((d, i) => {
          const side = i === 0 ? "left" : "right";
          return (
            <div key={d.name || i} className="relative overflow-hidden">
              <div
                className="relative h-[50vh] overflow-hidden bg-background"
                style={{
                  clipPath: open ? `inset(0 0 ${lift}px 0)` : "inset(0 0 0 0)",
                  transition: `clip-path 0.6s ${EASE}`,
                }}
              >
                <img
                  src={img}
                  alt={d.name}
                  className="absolute top-0 h-full max-w-none object-cover grayscale"
                  style={{
                    width: "200%",
                    [side]: 0,
                    transform: inView ? "translateY(0)" : "translateY(101%)",
                    // No per-half stagger: both halves rise in perfect sync so the
                    // split photo reads as ONE image lifting in, not two.
                    transition: `transform 0.9s ${RISE}`,
                  }}
                />
              </div>

              <div
                style={{
                  transform: open ? `translateY(-${lift}px)` : "translateY(0)",
                  opacity: inView ? 1 : 0,
                  transition: `transform 0.6s ${EASE}, opacity 0.6s ease 120ms`,
                }}
              >
                <p className="mt-4 text-base font-medium">{d.name}</p>
                <p className="text-sm text-muted">{d.role}</p>
              </div>

              {/* desktop: bio reveals in the clipped space under each half */}
              {d.bio ? (
                <div
                  className="absolute inset-x-0 bottom-0 hidden sm:block"
                  style={{
                    opacity: open ? 1 : 0,
                    transition: `opacity 0.45s ease ${open ? "0.12s" : "0s"}`,
                  }}
                >
                  <p
                    ref={i === 0 ? bio0 : bio1}
                    className="pt-6 text-sm leading-relaxed text-muted"
                  >
                    {d.bio}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* mobile: the images stay a joined 2-up above; the bios stack
          single-column below, revealed when expanded. */}
      <div
        className={`grid grid-cols-1 gap-6 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:hidden ${
          open ? "mt-6 max-h-[1200px] opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        {directors.map((d, i) =>
          d.bio ? (
            <div key={d.name || i}>
              <p className="text-sm font-medium">{d.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{d.bio}</p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

export default function TeamGrid({
  teamLead,
  team,
  heading = "Team",
}: {
  teamLead: TeamLead;
  team: TeamMember[];
  heading?: string;
}) {
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
          {directors.length > 0 ? (
            <DirectorsPair directors={directors} img={teamLead.img} />
          ) : null}

          {team.map((m, i) => {
            const lastAlone = i === team.length - 1 && team.length % 2 === 1;
            return (
              <div
                key={m.name || i}
                className={lastAlone ? "sm:col-start-2" : ""}
              >
                <Member m={m} delay={(i % 2) * 120} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
