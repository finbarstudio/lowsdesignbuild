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

  // ResizeObserver (not a one-shot measure): the bio's height changes after
  // mount — web-font swap, column width settling — and a stale height clips
  // the bio's tail off against the card edge.
  useEffect(() => {
    const el = bioRef.current;
    if (!el) return;
    const measure = () => setBioH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [m.bio]);

  const open = hover || tapped;
  const lift = m.bio ? bioH : 0;

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden"
      // pointer-type guarded: on touch, mouseenter fires on tap and never
      // leaves, which wedged `open` true — the minus button couldn't close.
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHover(false);
      }}
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
        className="relative"
        style={{
          transform: open ? `translateY(-${lift}px)` : "translateY(0)",
          opacity: inView ? 1 : 0,
          transition: `transform 0.6s ${EASE}, opacity 0.6s ease ${delay + 120}ms`,
        }}
      >
        <p className="mt-4 text-base font-medium">{m.name}</p>
        <p className="text-sm text-muted">{m.role}</p>

        {/* bio: anchored to the name block (top-full → its top is stuck to the
            bottom of the name/role, riding up with it), and the text rises up
            out of a mask at its bottom edge rather than fading in. */}
        {m.bio ? (
          <div className="absolute inset-x-0 top-full overflow-hidden">
            <p
              ref={bioRef}
              className="pt-2 text-sm leading-relaxed text-muted"
              style={{
                transform: open ? "translateY(0)" : "translateY(103%)",
                transition: `transform 0.6s ${EASE}`,
              }}
            >
              {m.bio}
            </p>
          </div>
        ) : null}
      </div>
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

  // ResizeObserver on both bios (see Member) — a stale height clips the taller
  // bio's tail off against the card edge once fonts/layout settle.
  useEffect(() => {
    const els = [bio0.current, bio1.current].filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const measure = () =>
      setBioH(
        Math.max(bio0.current?.offsetHeight ?? 0, bio1.current?.offsetHeight ?? 0),
      );
    measure();
    const ro = new ResizeObserver(measure);
    els.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
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
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHover(false);
      }}
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
            <div
              key={d.name || i}
              className="relative overflow-visible sm:overflow-hidden"
            >
              {/* shorter on mobile so more of the wide photo's WIDTH reads */}
              <div
                className="relative h-[34vh] overflow-hidden bg-background sm:h-[50vh]"
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

              {/* text is inset by half the team grid's gap (gap-x-6 → 12px) so the
                  two names/bios line up with the team's two columns below, while
                  the photo above stays a full joined 2-up. On DESKTOP the block
                  lifts as the bio reveals beneath its half. On MOBILE the name +
                  role + bio move together into the single-column stack below when
                  expanded, so this above-photo name fades out (no duplication). */}
              <div
                className={`relative ${i === 0 ? "sm:pr-3" : "sm:pl-3"}`}
                style={{
                  transform: !isMobile && open ? `translateY(-${lift}px)` : "translateY(0)",
                  opacity: inView ? (isMobile && open ? 0 : 1) : 0,
                  transition: `transform 0.6s ${EASE}, opacity 0.4s ease ${
                    isMobile && open ? "0s" : "120ms"
                  }`,
                }}
              >
                <p className="mt-4 text-base font-medium">{d.name}</p>
                <p className="text-sm text-muted">{d.role}</p>

                {/* desktop: bio anchored under the name/role (top-full — its
                    top stays stuck to them as they lift), text rising up out of
                    a mask at its bottom edge. Absolute children ignore the
                    container's padding, so the column inset is re-applied. */}
                {d.bio ? (
                  <div
                    className={`absolute inset-x-0 top-full hidden overflow-hidden sm:block ${
                      i === 0 ? "sm:pr-3" : "sm:pl-3"
                    }`}
                  >
                    <p
                      ref={i === 0 ? bio0 : bio1}
                      className="pt-2 text-sm leading-relaxed text-muted"
                      style={{
                        transform: open ? "translateY(0)" : "translateY(103%)",
                        transition: `transform 0.6s ${EASE}`,
                      }}
                    >
                      {d.bio}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* mobile: the images stay a joined 2-up above; when expanded each
          director's name + role + bio move together into a single-column stack
          below (the above-photo names fade out, so nothing is duplicated). Each
          block slides up + fades in on a slight stagger, and the two directors
          are clearly separated (gap-10). */}
      <div
        className={`grid grid-cols-1 gap-10 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:hidden ${
          open ? "mt-6 max-h-[2000px] opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        {directors.map((d, i) =>
          d.name || d.bio ? (
            <div
              key={d.name || i}
              style={{
                transform: open ? "translateY(0)" : "translateY(14px)",
                opacity: open ? 1 : 0,
                transition: `transform 0.5s ${EASE} ${i * 90}ms, opacity 0.5s ease ${i * 90}ms`,
              }}
            >
              <p className="text-base font-medium">{d.name}</p>
              {d.role ? (
                <p className="mb-3 text-sm text-muted">{d.role}</p>
              ) : null}
              {d.bio ? (
                <p className="text-sm leading-relaxed text-muted">{d.bio}</p>
              ) : null}
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
