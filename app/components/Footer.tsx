import DockingCta from "@/app/components/DockingCta";
import Wordmark from "@/app/components/Wordmark";
import { areas, nav, site } from "@/app/lib/site";

const YEAR = 2026;

/**
 * Footer — "Marquee Band" (studio 14), on our tokens + the real LOWS lockup.
 * The wordmark + a CTA slot, three columns (menu / where we work / contact) and
 * a legal bar. Full-width — no max-width on the inner; content runs edge to edge
 * with a symmetric gutter. Keeps id="site-footer" for the chrome's scroll colour
 * switch, and reserves #footer-cta-slot as the landing spot for the floating
 * "Get an instant quote" CTA, which docks into it as you reach the footer.
 */
export default function Footer() {
  return (
    <footer id="site-footer" className="c-ft-marquee" role="contentinfo">
      <style>{css}</style>

      <div className="c-ft-marquee__inner">
        <div className="c-ft-marquee__lead">
          <Wordmark className="c-ft-marquee__wm aspect-[121.71/55.33] w-[clamp(190px,32vw,400px)] text-tertiary" />

          {/* The single "Get an instant quote" CTA. On the home page it floats
              bottom-right while scrolling and docks into this slot at the footer
              (see DockingCta); on inner pages it just sits here statically. */}
          <div id="footer-cta-slot" className="c-ft-marquee__cta-slot">
            <DockingCta />
          </div>
        </div>

        <div className="c-ft-marquee__cols">
          <nav className="c-ft-marquee__col" aria-label="Sitemap">
            <h2 className="c-ft-marquee__ch">Menu</h2>
            <ul className="c-ft-marquee__list">
              {nav.map((item) => (
                <li key={item.href}>
                  <a className="link-underline" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="c-ft-marquee__col">
            <h2 className="c-ft-marquee__ch">Where we work</h2>
            <ul className="c-ft-marquee__list c-ft-marquee__list--plain">
              {areas.slice(0, 5).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="c-ft-marquee__col c-ft-marquee__col--contact">
            <h2 className="c-ft-marquee__ch">Get in touch</h2>
            <address className="c-ft-marquee__addr">
              <a
                className="c-ft-marquee__contact link-underline"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
              <a
                className="c-ft-marquee__contact link-underline"
                href={site.phoneHref}
              >
                {site.phone}
              </a>
              <span className="c-ft-marquee__place">South London</span>
            </address>
            <ul className="c-ft-marquee__social" aria-label="Social">
              <li>
                <a
                  className="link-underline"
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  className="link-underline"
                  href={site.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="c-ft-marquee__bar">
          <p className="c-ft-marquee__legal">
            © {YEAR} {site.name}. All rights reserved.
          </p>
          <a
            className="c-ft-marquee__legal c-ft-marquee__credit"
            href="https://www.finbar.studio"
            target="_blank"
            rel="noopener noreferrer"
          >
            Site by finbar.studio
          </a>
        </div>
      </div>
    </footer>
  );
}

const css = `
.c-ft-marquee{
  --ft-marquee-dur: 34s;
  /* Match HomeChrome/Header EDGE (px-5 sm:px-7 = 20px / 28px) so the footer's
     left/right gutter lines up exactly with the nav items above. */
  --ft-marquee-pad: 20px;
  display:block; width:100%;
  background:var(--background); color:var(--ink);
  font-family:var(--font-mono-stack);
  box-sizing:border-box;
}
.c-ft-marquee *{box-sizing:border-box;}

.c-ft-marquee__marquee{
  position:relative; overflow:hidden; width:100%;
  padding:22px 0; border-bottom:1px solid var(--line);
  -webkit-mask-image:linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
          mask-image:linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
}
.c-ft-marquee__track{
  display:flex; width:max-content; white-space:nowrap;
  will-change:transform;
  animation:ft-marquee-scroll var(--ft-marquee-dur) linear infinite;
}
.c-ft-marquee__marquee:hover .c-ft-marquee__track,
.c-ft-marquee__marquee:focus-within .c-ft-marquee__track{ animation-play-state:paused; }
.c-ft-marquee__group{display:inline-flex; align-items:center;}
.c-ft-marquee__cell{display:inline-flex; align-items:center;}
.c-ft-marquee__word{
  font-size:clamp(28px, 5.4vw, 62px);
  line-height:1; font-weight:700;
  letter-spacing:-0.01em; text-transform:uppercase;
  color:var(--ink); padding:0 0.28em;
}
.c-ft-marquee__sep{
  font-size:clamp(14px, 2.4vw, 26px);
  color:var(--copper); padding:0 0.35em;
  transform:translateY(-0.08em);
}
@keyframes ft-marquee-scroll{
  from{transform:translate3d(0,0,0);}
  to{transform:translate3d(-50%,0,0);}
}

.c-ft-marquee__inner{
  /* Capped to the same 1900px content box as the nav (HomeChrome), centred, with
     the matching EDGE gutter — so the footer's left/right edges align exactly
     with the nav items above on every viewport. */
  width:100%; max-width:1900px; margin:0 auto;
  padding:clamp(44px,6vw,72px) var(--ft-marquee-pad) 16px;
}
@media (min-width:640px){
  .c-ft-marquee{ --ft-marquee-pad: 28px; }
}
.c-ft-marquee__lead{
  display:flex; flex-wrap:wrap; align-items:flex-end;
  justify-content:space-between; gap:28px 40px;
  padding-bottom:clamp(36px,5vw,52px);
  border-bottom:1px solid var(--line);
}
.c-ft-marquee__wm{ margin:0 0 4px; }

/* Landing slot for the docking "Get an instant quote" CTA. Sizes to the pill it
   holds and sits at the wordmark's baseline on the right of the lead row. */
.c-ft-marquee__cta-slot{
  display:inline-flex; align-items:center;
  margin:0 0 2px;
}
/* On mobile the lead row stacks; keep the CTA its natural width, left-aligned
   (consistent everywhere — matches the bottom-left floating button that docks
   into it), rather than stretching full width on some pages. */
@media (max-width:560px){
  .c-ft-marquee__cta-slot{ width:100%; justify-content:flex-start; margin-top:22px; }
}
.c-ft-marquee__tag{
  margin:16px 0 0; font-size:13px; line-height:1.5;
  letter-spacing:0.01em; color:var(--ink);
}
.c-ft-marquee__tag--sub{margin-top:4px; color:var(--muted);}

.c-ft-marquee__cta{
  display:inline-flex; align-items:baseline; gap:0.7em;
  text-decoration:none; color:var(--ink);
  font-size:15px; letter-spacing:0.02em;
  padding:14px 26px 14px 24px;
  border:1px solid var(--ink); border-radius:2px;
  background:transparent;
  transition:background .35s cubic-bezier(.2,.7,.2,1),
             color .35s cubic-bezier(.2,.7,.2,1),
             border-color .35s cubic-bezier(.2,.7,.2,1);
  white-space:nowrap;
}
.c-ft-marquee__cta-arrow{transition:transform .4s cubic-bezier(.2,.7,.2,1); display:inline-block;}
.c-ft-marquee__cta:hover{background:var(--ink); color:var(--background); border-color:var(--ink);}
.c-ft-marquee__cta:hover .c-ft-marquee__cta-arrow{transform:translateX(5px);}

.c-ft-marquee__cols{
  display:grid; gap:clamp(32px,4vw,48px);
  grid-template-columns:repeat(3, minmax(0,1fr));
  padding:clamp(40px,5vw,56px) 0 clamp(36px,4vw,48px);
}
.c-ft-marquee__col{min-width:0;}
.c-ft-marquee__ch{
  margin:0 0 20px; font-size:11px; font-weight:700;
  letter-spacing:0.22em; text-transform:uppercase;
  color:var(--copper-deep);
}
.c-ft-marquee__list, .c-ft-marquee__social{ list-style:none; margin:0; padding:0; }
.c-ft-marquee__list li{margin:0 0 11px;}
.c-ft-marquee__list--plain li{ font-size:14px; line-height:1.4; color:var(--ink); }
/* Links use the shared .link-underline token (a 1px line tight under the text,
   drawn left→right on hover) — same as the top nav, cropped to the text. */
.c-ft-marquee__list a,
.c-ft-marquee__contact,
.c-ft-marquee__social a{
  display:inline-block;
  text-decoration:none; color:var(--ink);
  font-size:14px; line-height:1.4; letter-spacing:0.01em;
  transition:color .3s ease;
}
.c-ft-marquee__list a:hover,
.c-ft-marquee__contact:hover,
.c-ft-marquee__social a:hover{color:var(--copper-deep);}

/* align-items:flex-start — in a flex COLUMN the links would otherwise stretch to
   the full column width, so their hover underline drew far past the text. */
.c-ft-marquee__addr{font-style:normal; display:flex; flex-direction:column; align-items:flex-start; gap:11px; margin-bottom:22px;}
.c-ft-marquee__place{font-size:14px; color:var(--muted); letter-spacing:0.01em;}
.c-ft-marquee__social{display:flex; flex-wrap:wrap; gap:10px 22px;}
.c-ft-marquee__social a{font-size:13px;}

/* legal bar: copyright hard left, credit hard right, tight padding */
.c-ft-marquee__bar{
  display:flex; flex-wrap:wrap; align-items:center;
  justify-content:space-between;
  gap:10px 28px; padding-top:14px;
  border-top:1px solid var(--line);
}
.c-ft-marquee__legal{margin:0; font-size:12px; letter-spacing:0.01em; color:var(--muted);}
/* hard right (margin-left, not just space-between, so it stays right even if
   the bar ever wraps). Declared after __legal's margin:0 reset so it wins. */
.c-ft-marquee__credit{ text-decoration:none; margin-left:auto; }
.c-ft-marquee__credit:hover{ color:var(--copper-deep); }

.c-ft-marquee a:focus-visible{ outline:2px solid var(--slate-blue); outline-offset:4px; border-radius:1px; }

@media (max-width:860px){
  .c-ft-marquee__cols{grid-template-columns:repeat(2,minmax(0,1fr)); gap:36px 32px;}
  .c-ft-marquee__col--contact{grid-column:1 / -1;}
}
@media (max-width:560px){
  .c-ft-marquee__lead{align-items:flex-start;}
  .c-ft-marquee__cta{width:100%; justify-content:space-between;}
  /* menu + where-we-work sit side by side; contact spans the full width below */
  .c-ft-marquee__cols{grid-template-columns:repeat(2,minmax(0,1fr)); gap:36px 20px;}
  .c-ft-marquee__col--contact{grid-column:1 / -1;}
  .c-ft-marquee__bar{gap:14px;}
}

@media (prefers-reduced-motion:reduce){
  .c-ft-marquee__track{animation:none; transform:translate3d(-12%,0,0);}
  .c-ft-marquee__cta,
  .c-ft-marquee__cta-arrow,
  .c-ft-marquee__list a,
  .c-ft-marquee__contact,
  .c-ft-marquee__social a{transition:none;}
}
`;
