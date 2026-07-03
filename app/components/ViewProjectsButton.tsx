import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url";

import VpFlowHighlight from "@/app/components/VpFlowHighlight";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PROJECT_THUMBS_QUERY } from "@/sanity/lib/queries";

/**
 * "Held photographs" CTA — a Space Mono pill that, on desktop hover (or
 * keyboard focus), fans three real project photos out from behind it like a
 * spread stack. On touch devices the fan is suppressed (hover is gated to
 * fine-pointer devices), so a tap simply follows the link to /projects.
 *
 * The three photos are the lead projects' hero images (`mainImage`), pulled
 * live from Sanity — so the fan tracks the CMS automatically (inherits the
 * page's `revalidate`). Async server component: no client JS. If no project
 * hero is set (or the fetch fails) it falls back to bundled service photos so
 * the fan is never empty.
 */
type Thumb = { _id: string; title: string | null; mainImage: SanityImageSource | null };

const FALLBACK = [
  "/services/loft.jpg",
  "/services/architectural.jpg",
  "/services/renovations.jpg",
];

export default async function ViewProjectsButton({
  className = "",
}: {
  className?: string;
}) {
  let photos: string[] = [];
  try {
    const thumbs = await client.fetch<Thumb[]>(PROJECT_THUMBS_QUERY);
    photos = thumbs
      .filter((t) => t.mainImage)
      .map((t) =>
        urlFor(t.mainImage as SanityImageSource)
          .width(228)
          .height(168)
          .fit("crop")
          .url(),
      );
  } catch {
    // fall through to FALLBACK below
  }

  // The fan has three slots; cycle through whatever we got, else the fallback.
  const src = photos.length ? photos : FALLBACK;
  const fan = [0, 1, 2].map((i) => src[i % src.length]);

  return (
    <div className={`flex justify-center ${className}`}>
      <style>{css}</style>
      <VpFlowHighlight>
        <Link href="/projects" className="vp" aria-label="View projects">
          <span className="vp__fan" aria-hidden="true">
            {fan.map((url, i) => (
              <span
                key={i}
                className={`vp__photo vp__photo--${i + 1}`}
                style={{ backgroundImage: `url("${url}")` }}
              />
            ))}
          </span>
          <span className="vp__label">View projects</span>
        </Link>
      </VpFlowHighlight>
    </div>
  );
}

const css = `
.vp {
  --vp-ease: cubic-bezier(0.19, 1, 0.22, 1);
  --vp-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95em 1.9em;
  background: var(--background);
  border: 1px solid var(--ink);
  border-radius: 999px;
  text-decoration: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.5s var(--vp-ease),
              box-shadow 0.5s var(--vp-ease),
              transform 0.5s var(--vp-ease);
}

.vp__label {
  position: relative;
  z-index: 3;
  font-family: var(--font-mono-stack);
  font-size: 0.78rem;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--ink);
  white-space: nowrap;
  transition: color 0.5s var(--vp-ease);
}

/* The fan is anchored behind the pill's top edge and never intercepts taps */
.vp__fan {
  position: absolute;
  left: 50%;
  bottom: 60%;
  width: 0;
  height: 0;
  z-index: 1;
  pointer-events: none;
}

.vp__photo {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 76px;
  height: 56px;
  margin-left: -38px;
  border-radius: 3px;
  background-color: var(--line);
  background-size: cover;
  background-position: center;
  box-shadow: 0 1px 2px rgba(66, 73, 82, 0.14);
  outline: 3px solid var(--background); /* printed-edge border */
  outline-offset: -1px;
  transform-origin: 50% 120%;
  opacity: 0;
  transform: translateY(28px) rotate(0deg) scale(0.9); /* tucked behind */
  transition: transform 0.55s var(--vp-ease),
              opacity 0.4s var(--vp-ease),
              box-shadow 0.55s var(--vp-ease);
}

/* ============================================================
   REVEAL — two separate triggers:
     • :focus-visible  → keyboard users on every device (accessible);
                         a touch tap never matches :focus-visible.
     • :hover          → GATED to real hover + fine pointer only, so a
                         phone/tablet tap follows the link instead of
                         fanning the stack.
   ============================================================ */
.vp:focus-visible .vp__photo--1 {
  opacity: 1;
  transform: translateY(-14px) translateX(-46px) rotate(-13deg) scale(1);
  box-shadow: 0 10px 20px rgba(66, 73, 82, 0.16);
  transition-timing-function: var(--vp-spring);
  transition-delay: 0.03s;
}
.vp:focus-visible .vp__photo--2 {
  opacity: 1;
  transform: translateY(-22px) translateX(0) rotate(1.5deg) scale(1.04);
  box-shadow: 0 14px 26px rgba(66, 73, 82, 0.2);
  transition-timing-function: var(--vp-spring);
  z-index: 2;
}
.vp:focus-visible .vp__photo--3 {
  opacity: 1;
  transform: translateY(-14px) translateX(46px) rotate(13deg) scale(1);
  box-shadow: 0 10px 20px rgba(66, 73, 82, 0.16);
  transition-timing-function: var(--vp-spring);
  transition-delay: 0.06s;
}
.vp:focus-visible {
  border-color: var(--copper);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(66, 73, 82, 0.1);
  outline: 2px solid var(--slate-blue);
  outline-offset: 3px;
}
.vp:focus-visible .vp__label { color: var(--copper-deep); }

@media (hover: hover) and (pointer: fine) {
  .vp:hover .vp__photo--1 {
    opacity: 1;
    transform: translateY(-14px) translateX(-46px) rotate(-13deg) scale(1);
    box-shadow: 0 10px 20px rgba(66, 73, 82, 0.16);
    transition-timing-function: var(--vp-spring);
    transition-delay: 0.03s;
  }
  .vp:hover .vp__photo--2 {
    opacity: 1;
    transform: translateY(-22px) translateX(0) rotate(1.5deg) scale(1.04);
    box-shadow: 0 14px 26px rgba(66, 73, 82, 0.2);
    transition-timing-function: var(--vp-spring);
    z-index: 2;
  }
  .vp:hover .vp__photo--3 {
    opacity: 1;
    transform: translateY(-14px) translateX(46px) rotate(13deg) scale(1);
    box-shadow: 0 10px 20px rgba(66, 73, 82, 0.16);
    transition-timing-function: var(--vp-spring);
    transition-delay: 0.06s;
  }
  .vp:hover {
    border-color: var(--copper);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(66, 73, 82, 0.1);
  }
  .vp:hover .vp__label { color: var(--copper-deep); }
}

.vp:active { transform: translateY(0); }

/* ============================================================
   LANDED — the travelling dot has reached the bottom of the
   timeline (signalled by ProcessPath via VpFlowHighlight). The
   pill border + label go gold and it lifts, so the gold line
   reads as flowing into the button. A gold halo above the pill
   is the dot arriving. Additive: without a ProcessFlow provider
   .vp-flow--landed never applies, so the button is unaffected.
   ============================================================ */
/* position:relative anchors the trace SVG overlay. (The centre-reveal motion —
   rise + grow to fill the process centre — is driven on the wrapper by
   ProcessPath, not here.) */
.vp-flow {
  position: relative;
  display: inline-flex;
}
/* Trace variant (process flow only): the pill carries NO visible outline of its
   own — the gold SVG trace is the only outline, drawn on when the dot lands. */
.vp-flow--trace .vp { border-color: transparent; }
.vp-flow--landed .vp__label { color: var(--copper-deep); }

/* OUTLINE TRACE: an SVG overlay sized to the pill (two half-paths, top-centre →
   each side → bottom-centre). At rest each path is fully dash-offset (invisible);
   on landed they draw to offset 0, so the gold outline traces on from the top
   middle down both sides to the bottom middle. No glow — just the line. */
.vp-trace {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 2;
}
.vp-trace__p {
  fill: none;
  stroke: var(--tertiary);
  stroke-width: 1.25px;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.vp-flow--landed .vp-trace__p {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.45, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  /* The trace snaps on without drawing. */
  .vp-flow--landed .vp-trace__p { transition: none; }
  .vp, .vp__label, .vp__photo { transition-duration: 0.001ms; }
  .vp:focus-visible .vp__photo--1,
  .vp:focus-visible .vp__photo--2,
  .vp:focus-visible .vp__photo--3 { transition-delay: 0s; }
}
`;
