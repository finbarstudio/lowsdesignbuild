"use client";

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * "What we do" — an aspect-aware GREEDY BEST-FIT pack that fills a fixed-height
 * section.
 *
 * We treat the job as packing N native-aspect rectangles into the measured W×H
 * area with the tightest possible fill and the least distortion. The images stay
 * in their CMS order and are laid out as justified rows; for every plausible
 * row-partition we SOLVE for the usable width that makes the naturally stacked
 * row heights add up to exactly H. Because each row is width-justified at its own
 * natural height, images sit at their native aspect ratio — no object-cover
 * butchering — while the column of rows fills the full height. The partition with
 * the best fit (least distortion, then least side gutter, then most even rows)
 * wins the greedy search.
 *
 * When the ordered aspects genuinely cannot fill H at any width in range (very
 * tall or very short content), we clamp the usable width and apply one small,
 * capped vertical scale so the area still fills; that is the only case that can
 * introduce a few percent of crop, and it is bounded.
 *
 * Needs the live container W×H, so this is a client component with a
 * ResizeObserver. It FAILS OPEN: before JS measures (and on very small screens) a
 * plain CSS layout of native-aspect tiles renders, so images are always visible
 * even without / before JS.
 *
 * Card design is preserved on every tile: one photo, a dark gradient along the
 * bottom, the title over it; on hover the title lifts and the description reveals
 * up from a mask below.
 */

type Service = {
  title: string;
  blurb: string;
  img: string;
  lqip?: string;
  /** native width / height from Sanity metadata; optional (fallback imgs lack it) */
  aspect?: number;
};

type Box = { left: number; top: number; width: number; height: number };

const GAP = 12; // px between tiles (matches the old sm:gap-3 ≈ 0.75rem)
const MAX_ROWS = 4; // most rows we'll stack on desktop (keeps tiles a sensible size)
const MIN_USABLE_FRAC = 0.6; // never let centred side gutters exceed ~40% of the width
const MAX_SCALE_LOG = 0.12; // fallback height-scale cap → ≤ ~11% crop, only at extremes
const FALLBACK_ASPECT = 4 / 3; // gentle landscape until an image reports its real ratio
const NARROW = 640; // below this width, use the crop-free stacked fallback

const rowSum = (row: number[], aspects: number[]) =>
  row.reduce((s, i) => s + aspects[i], 0);

/** natural stacked content height (excludes inter-row gaps) at usable width w */
function stackedHeight(rows: number[][], aspects: number[], w: number): number {
  return rows.reduce((s, row) => {
    const inner = w - (row.length - 1) * GAP;
    return s + inner / rowSum(row, aspects);
  }, 0);
}

/** all compositions of `n` items into exactly `parts` ordered positive groups */
function compositions(n: number, parts: number): number[][] {
  const out: number[][] = [];
  const cur: number[] = [];
  const rec = (left: number, p: number) => {
    if (p === 1) {
      out.push([...cur, left]);
      return;
    }
    for (let x = 1; x <= left - (p - 1); x++) {
      cur.push(x);
      rec(left - x, p - 1);
      cur.pop();
    }
  };
  rec(n, parts);
  return out;
}

/** slice item indices [0..n) into contiguous rows per a composition */
function toRows(n: number, comp: number[]): number[][] {
  const rows: number[][] = [];
  let i = 0;
  for (const c of comp) {
    const row: number[] = [];
    for (let k = 0; k < c; k++) row.push(i++);
    rows.push(row);
  }
  return rows;
}

/**
 * Greedy best-fit solver. Returns absolute pixel boxes for each item, centred in
 * the W×H area. Tries every row-partition, solving each for the width that fills
 * H exactly at native aspects; scores fill quality, distortion, gutter and row
 * evenness; the best wins.
 */
function layout(
  aspects: number[],
  width: number,
  height: number,
  maxRows: number,
): Box[] {
  const n = aspects.length;
  if (n === 0 || width <= 0 || height <= 0) return [];

  const minW = width * MIN_USABLE_FRAC;
  const cap = Math.min(n, maxRows);

  let best: { rows: number[][]; usableW: number; scale: number } | null = null;
  let bestScore = Infinity;

  for (let r = 1; r <= cap; r++) {
    for (const comp of compositions(n, r)) {
      const rows = toRows(n, comp);
      const targetContent = height - (r - 1) * GAP; // content height to fill

      // stackedHeight(w) = w·K − gapTerm  (linear in w) → solve for exact fill.
      const K = rows.reduce((s, row) => s + 1 / rowSum(row, aspects), 0);
      const gapTerm = rows.reduce(
        (s, row) => s + ((row.length - 1) * GAP) / rowSum(row, aspects),
        0,
      );
      const wExact = (targetContent + gapTerm) / K;

      let usableW: number;
      let scale = 1; // vertical scale of row heights (1 = perfectly crop-free)

      if (wExact <= width && wExact >= minW) {
        // Ideal: fill H exactly at native aspects, with a modest centred gutter.
        usableW = wExact;
      } else {
        // wExact is out of range → clamp the usable width to whichever bound is
        // nearest and take up the slack with ONE capped vertical scale. The scale
        // is clamped both ways so on-screen crop can never exceed ~11% (e^±0.12);
        // any fill still missing after the cap is absorbed as a centred margin.
        usableW = wExact > width ? width : minW;
        const nat = stackedHeight(rows, aspects, usableW);
        scale = Math.min(
          Math.exp(MAX_SCALE_LOG),
          Math.max(Math.exp(-MAX_SCALE_LOG), targetContent / nat),
        );
      }

      // Score: fill residual (worst), then crop, then side gutter + uneven rows.
      // `overflow` is penalised hard so the pack never spills past the section
      // (it would clip into the next section); a centred margin is always safer.
      const content = stackedHeight(rows, aspects, usableW) * scale;
      const total = content + (rows.length - 1) * GAP;
      const residual = Math.abs(height - total) / height;
      const overflow = total > height ? (total - height) / height : 0;
      const crop = Math.abs(Math.log(scale));
      const gutter = (width - usableW) / width;
      const heights = rows.map(
        (row) => (usableW - (row.length - 1) * GAP) / rowSum(row, aspects),
      );
      const mean = heights.reduce((s, h) => s + h, 0) / r || 1;
      const varc =
        heights.reduce((s, h) => s + (h - mean) ** 2, 0) / r / (mean * mean);

      const score =
        residual * 1.4 +
        crop * 1.6 +
        gutter * 0.55 +
        varc * 0.22 +
        overflow * 3;
      if (score < bestScore) {
        bestScore = score;
        best = { rows, usableW, scale };
      }
    }
  }
  if (!best) return [];

  // Realise the winning plan into absolute boxes, centred both ways.
  const heights = best.rows.map(
    (row) =>
      ((best!.usableW - (row.length - 1) * GAP) / rowSum(row, aspects)) *
      best!.scale,
  );
  const totalH =
    heights.reduce((a, b) => a + b, 0) + GAP * (best.rows.length - 1);
  const offsetX = (width - best.usableW) / 2;
  const offsetY = Math.max(0, (height - totalH) / 2);

  const boxes: Box[] = new Array(n);
  let top = offsetY;
  best.rows.forEach((row, ri) => {
    const h = heights[ri];
    let left = offsetX;
    for (const i of row) {
      const w = h * aspects[i];
      boxes[i] = { left, top, width: w, height: h };
      left += w + GAP;
    }
    top += h + GAP;
  });
  return boxes;
}

export default function ServiceMasonry({ services }: { services: Service[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  // Aspect ratios learned from <img> onLoad for images without Sanity metadata.
  const [measured, setMeasured] = useState<Record<number, number>>({});

  // Measure the container (width + height) so the pack can fill the fixed-height
  // flex-1 area at any viewport size, and re-pack on resize.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr && cr.width > 0 && cr.height > 0)
        setBox({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Resolve each image's aspect: Sanity metadata → a measured value → a sane
  // default, so the pack is stable before anything loads and self-corrects after.
  const aspects = useMemo(
    () =>
      services.map(
        (s, i) =>
          (s.aspect && s.aspect > 0 ? s.aspect : undefined) ??
          measured[i] ??
          FALLBACK_ASPECT,
      ),
    [services, measured],
  );

  const isNarrow = !!box && box.w < NARROW;
  const boxes = useMemo(
    () => (box && !isNarrow ? layout(aspects, box.w, box.h, MAX_ROWS) : null),
    [aspects, box, isNarrow],
  );

  // Learn real aspect ratios for images that arrived without Sanity metadata
  // (the bundled fallback photos), so the pack corrects itself after first paint.
  const onImgLoad =
    (index: number, hasMeta: boolean) =>
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (hasMeta) return;
      const el = e.currentTarget;
      if (!el.naturalWidth || !el.naturalHeight) return;
      const a = el.naturalWidth / el.naturalHeight;
      setMeasured((prev) =>
        prev[index] && Math.abs(prev[index] - a) < 0.001
          ? prev
          : { ...prev, [index]: a },
      );
    };

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {boxes
        ? // Measured: absolute best-fit pack, filling width and height.
          services.map((s, i) => {
            const b = boxes[i];
            if (!b) return null;
            return (
              <Card
                key={`${s.title}-${i}`}
                service={s}
                index={i}
                hasMeta={!!(s.aspect && s.aspect > 0)}
                onImgLoad={onImgLoad}
                style={{
                  position: "absolute",
                  left: b.left,
                  top: b.top,
                  width: b.width,
                  height: b.height,
                }}
              />
            );
          })
        : /* Fail-open fallback: very small screens + the first paint before the
             ResizeObserver measures. Native-aspect tiles that keep every image's
             shape; a two-up float on ≥sm, single column below, scrolling only if
             it truly must on a phone. */
          services.map((s, i) => (
            <div
              key={`${s.title}-${i}`}
              className="relative float-left mb-3 w-full sm:mr-3 sm:w-[calc(50%-0.375rem)]"
              style={{ aspectRatio: String(aspects[i]) }}
            >
              <Card
                service={s}
                index={i}
                hasMeta={!!(s.aspect && s.aspect > 0)}
                onImgLoad={onImgLoad}
                style={{ position: "absolute", inset: 0 }}
              />
            </div>
          ))}
    </div>
  );
}

/** A single service tile — identical card design to the previous version. */
function Card({
  service,
  index,
  hasMeta,
  style,
  onImgLoad,
}: {
  service: Service;
  index: number;
  hasMeta: boolean;
  style: React.CSSProperties;
  onImgLoad: (
    index: number,
    hasMeta: boolean,
  ) => (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) {
  return (
    <div
      className="group overflow-hidden rounded-sm bg-[var(--line)]"
      style={style}
    >
      <img
        src={service.img}
        alt={service.title}
        loading="lazy"
        onLoad={onImgLoad(index, hasMeta)}
        style={
          service.lqip
            ? { backgroundImage: `url(${service.lqip})`, backgroundSize: "cover" }
            : undefined
        }
        // The cell is sized to the native aspect, so object-cover is only a
        // sub-pixel safety net (rounding), not a visible crop.
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />
      {/* dark gradient along the bottom for the title */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="text-base font-semibold leading-tight tracking-tight text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 sm:text-xl">
          {service.title}
        </h3>
        {/* description masks up from below on hover (0fr → 1fr) */}
        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100 motion-reduce:transition-none">
          <p className="overflow-hidden text-xs leading-relaxed text-white/85 sm:text-sm">
            {service.blurb}
          </p>
        </div>
      </div>
    </div>
  );
}
