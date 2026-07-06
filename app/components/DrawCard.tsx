"use client";

import { useEffect, useState } from "react";

/**
 * A form card whose hairline outline DRAWS itself on page load (an SVG rect
 * tracing clockwise from the top-left) while the contents fade up beneath it —
 * staggered per card via `delay`. Replaces the FORM_CARD border (the card
 * keeps FORM_CARD's radius/padding/background, minus the CSS border).
 *
 * `gold` draws the outline in the brand gold and carries the estimator card's
 * soft breathing glow once drawn.
 */
export default function DrawCard({
  delay = 0,
  gold = false,
  className = "",
  children,
}: {
  /** ms after mount before this card's draw + fade begins */
  delay?: number;
  gold?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGo(true);
      return;
    }
    const t = window.setTimeout(() => setGo(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`relative rounded-sm bg-background p-6 sm:p-8 ${
        gold && go ? "drawcard--breathe" : ""
      } ${className}`}
    >
      <style>{css}</style>
      {/* the outline — draws from the top-left, clockwise */}
      <svg className="drawcard__svg" aria-hidden="true">
        <rect
          className="drawcard__rect"
          pathLength={1}
          style={{
            stroke: gold ? "rgba(169,126,31,.55)" : "var(--line)",
            strokeDashoffset: go ? 0 : 1,
          }}
        />
      </svg>
      {/* contents fade up just behind the draw */}
      <div
        style={{
          opacity: go ? 1 : 0,
          transform: go ? "translateY(0)" : "translateY(12px)",
          transition:
            "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const css = `
.drawcard__svg{
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  overflow: visible;
}
.drawcard__rect{
  x: 0.5px; y: 0.5px;
  width: calc(100% - 1px); height: calc(100% - 1px);
  rx: 2px;
  fill: none;
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  transition: stroke-dashoffset 1.1s cubic-bezier(0.45, 0, 0.2, 1);
}
/* estimator highlight: the soft gold breathe, on the shadow only (the outline
   itself stays the drawn SVG stroke) */
.drawcard--breathe{ animation: drawcard-breathe 3.4s ease-in-out 1.2s infinite; }
@keyframes drawcard-breathe{
  0%, 100% { box-shadow: 0 0 0 0 rgba(169,126,31,0); }
  50% { box-shadow: 0 0 24px -8px rgba(169,126,31,.35); }
}
@media (prefers-reduced-motion: reduce){
  .drawcard__rect{ transition: none; }
  .drawcard--breathe{ animation: none; }
}
`;
