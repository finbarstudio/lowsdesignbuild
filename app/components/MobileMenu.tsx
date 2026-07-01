"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { nav, site } from "@/app/lib/site";
import { smoothScrollTop } from "@/app/lib/scrollTop";

/**
 * Mobile menu — "Right Drawer" (from the component kit, on our tokens).
 * An ~80%-width panel slides in from the right over a dimming backdrop; tapping
 * the backdrop or the X closes it. Links stack with hairline dividers, an index
 * number and a copper hover accent. Driven by our real nav + contact email, and
 * wired to the chrome's existing trigger via `open` / `onClose`.
 */
export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="mm-root" data-open={open ? "true" : "false"}>
      <style>{css}</style>

      <div className="mm-backdrop" aria-hidden="true" onClick={onClose} />

      <aside
        className="mm-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <div className="mm-panel-head">
          <span className="mm-eyebrow">Menu</span>
          <button
            className="mm-close"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <nav className="mm-nav" aria-label="Primary">
          {nav.map((item, i) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const isCurrent = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mm-link ${active ? "is-active" : ""}`}
                onClick={(e) => {
                  onClose();
                  if (isCurrent) {
                    e.preventDefault();
                    smoothScrollTop();
                  }
                }}
              >
                <span className="mm-idx">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mm-label">{item.label}</span>
                <span className="mm-arw" aria-hidden="true">
                  ↗
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mm-foot">
          <span className="mm-foot-line">Design &amp; build</span>
          <span className="mm-foot-line">South London</span>
          <a className="mm-mail" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
      </aside>
    </div>
  );
}

const css = `
.mm-root { position: fixed; inset: 0; z-index: 50; font-family: var(--font-mono-stack); color: var(--ink); pointer-events: none; -webkit-font-smoothing: antialiased; }
.mm-root * { box-sizing: border-box; }
@media (min-width: 640px) { .mm-root { display: none; } }

.mm-backdrop { position: fixed; inset: 0; background: rgba(43,55,66,.42); opacity: 0; visibility: hidden; pointer-events: none; cursor: pointer; transition: opacity .5s cubic-bezier(.4,0,.2,1), visibility 0s linear .5s; }
.mm-root[data-open="true"] .mm-backdrop { opacity: 1; visibility: visible; pointer-events: auto; transition: opacity .5s cubic-bezier(.4,0,.2,1); }

.mm-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 80%; max-width: 320px; background: var(--background); border-left: 1px solid var(--line); box-shadow: -24px 0 60px -24px rgba(43,55,66,.35); display: flex; flex-direction: column; transform: translateX(100%); transition: transform .5s cubic-bezier(.62,.03,.16,1); pointer-events: auto; }
.mm-root[data-open="true"] .mm-panel { transform: translateX(0); }

.mm-panel-head { height: 64px; flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; border-bottom: 1px solid var(--line); }
.mm-eyebrow { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--muted); }
.mm-close { width: 38px; height: 38px; margin-right: -10px; display: flex; align-items: center; justify-content: center; background: none; border: 0; color: var(--ink); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform .35s cubic-bezier(.7,0,.2,1), color .3s ease; }
.mm-close:hover { color: var(--copper); transform: rotate(90deg); }
.mm-close:focus-visible { outline: 2px solid var(--copper); outline-offset: 2px; border-radius: 2px; }

.mm-nav { flex: 1 1 auto; padding: 6px 0; display: flex; flex-direction: column; overflow-y: auto; }
.mm-link { position: relative; display: flex; align-items: baseline; gap: 14px; padding: 19px 22px; text-decoration: none; color: var(--ink); border-bottom: 1px solid var(--line); overflow: hidden; opacity: 0; transform: translateX(16px); transition: opacity .5s ease, transform .5s cubic-bezier(.62,.03,.16,1), background-color .35s ease; }
.mm-link::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--copper); transform: scaleY(0); transform-origin: top; transition: transform .4s cubic-bezier(.7,0,.2,1); }
.mm-root[data-open="true"] .mm-link { opacity: 1; transform: translateX(0); }
.mm-root[data-open="true"] .mm-link:nth-child(1) { transition-delay: .14s; }
.mm-root[data-open="true"] .mm-link:nth-child(2) { transition-delay: .20s; }
.mm-root[data-open="true"] .mm-link:nth-child(3) { transition-delay: .26s; }
.mm-root[data-open="true"] .mm-link:nth-child(4) { transition-delay: .32s; }
.mm-root[data-open="true"] .mm-link:nth-child(5) { transition-delay: .38s; }
.mm-root[data-open="true"] .mm-link:nth-child(6) { transition-delay: .44s; }
.mm-link:hover { background: rgba(169,126,31,.055); }
.mm-link:hover::before, .mm-link:focus-visible::before, .mm-link.is-active::before { transform: scaleY(1); }
.mm-link:focus-visible { outline: none; background: rgba(169,126,31,.06); }
.mm-idx { font-size: 10px; letter-spacing: .14em; color: var(--copper); font-weight: 700; min-width: 16px; font-variant-numeric: tabular-nums; }
.mm-label { font-size: 22px; letter-spacing: .005em; line-height: 1; flex: 1 1 auto; }
.mm-arw { font-size: 14px; color: var(--muted); opacity: 0; transform: translate(-4px,2px); transition: opacity .35s ease, transform .35s cubic-bezier(.7,0,.2,1); }
.mm-link:hover .mm-arw, .mm-link:focus-visible .mm-arw { opacity: 1; transform: translate(0,0); color: var(--copper); }

.mm-foot { flex: 0 0 auto; padding: 22px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 5px; }
.mm-foot-line { font-size: 11px; letter-spacing: .06em; color: var(--muted); }
.mm-foot-line:first-child { color: var(--ink); }
.mm-mail { margin-top: 9px; font-size: 11px; letter-spacing: .02em; color: var(--copper-deep); text-decoration: none; border-bottom: 1px solid transparent; align-self: flex-start; word-break: break-all; transition: border-color .3s ease; }
.mm-mail:hover { border-color: var(--copper); }
.mm-mail:focus-visible { outline: 2px solid var(--copper); outline-offset: 3px; border-radius: 1px; }

@media (prefers-reduced-motion: reduce) {
  .mm-panel, .mm-backdrop, .mm-link, .mm-arw, .mm-close { transition-duration: .001ms !important; transition-delay: 0s !important; }
}
`;
