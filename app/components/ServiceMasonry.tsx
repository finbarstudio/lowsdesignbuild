/* eslint-disable @next/next/no-img-element */

type Service = { title: string; blurb: string; img: string; lqip?: string };

/**
 * "What we do" — a masonry that fills its (100vh) section. Each card is one
 * photo with a dark gradient along the bottom; the title sits over it and, on
 * hover, lifts while the description reveals up from a mask below. `auto-rows-fr`
 * + dense flow keeps the tiles filling the available height at any count; the
 * span pattern gives the varied "optimal" sizes. Pure CSS — server component.
 */
const SPANS = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
  "",
];

export default function ServiceMasonry({ services }: { services: Service[] }) {
  return (
    <div className="grid h-full auto-rows-fr grid-cols-2 gap-2.5 [grid-auto-flow:dense] sm:grid-cols-3 sm:gap-3">
      {services.map((s, i) => (
        <div
          key={`${s.title}-${i}`}
          className={`group relative overflow-hidden rounded-sm bg-[var(--line)] ${SPANS[i % SPANS.length]}`}
        >
          <img
            src={s.img}
            alt={s.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
          {/* dark gradient along the bottom for the title */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="text-base font-semibold leading-tight tracking-tight text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 sm:text-xl">
              {s.title}
            </h3>
            {/* description masks up from below on hover (0fr → 1fr) */}
            <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100 motion-reduce:transition-none">
              <p className="overflow-hidden text-xs leading-relaxed text-white/85 sm:text-sm">
                {s.blurb}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
