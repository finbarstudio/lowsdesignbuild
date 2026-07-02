import Wordmark from "@/app/components/Wordmark";
import { areas, nav, site } from "@/app/lib/site";

const YEAR = 2026;

/**
 * Footer — "Marquee Band" (studio 14), on our tokens + the real LOWS lockup.
 * A scrolling "Let us build something" band, then the wordmark + a CTA, three
 * columns (menu / where we work / contact) and a legal bar. The marquee is a
 * pure-CSS loop (two identical groups translating -50%), so this stays a server
 * component; reduced-motion parks it. Keeps id="site-footer" for the chrome's
 * scroll colour switch.
 */
export default function Footer() {
  return (
    <footer id="site-footer" className="c-ft-marquee" role="contentinfo">
      <style>{css}</style>

      {/* scrolling band */}
      <div className="c-ft-marquee__marquee" aria-hidden="true">
        <div className="c-ft-marquee__track">
          {[0, 1].map((g) => (
            <span className="c-ft-marquee__group" key={g}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span className="c-ft-marquee__cell" key={i}>
                  <span className="c-ft-marquee__word">Let us build something</span>
                  <span className="c-ft-marquee__sep">◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="c-ft-marquee__inner">
        <div className="c-ft-marquee__lead">
          <div className="c-ft-marquee__brand">
            <Wordmark className="c-ft-marquee__wm aspect-[121.71/55.33] w-[clamp(180px,30vw,380px)] text-ink" />
            <p className="c-ft-marquee__tag">Design &amp; build — South London</p>
            <p className="c-ft-marquee__tag c-ft-marquee__tag--sub">
              Lofts, extensions &amp; full refurbishments
            </p>
          </div>
          <a className="c-ft-marquee__cta" href="/contact">
            <span className="c-ft-marquee__cta-label">Start a project</span>
            <span className="c-ft-marquee__cta-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className="c-ft-marquee__cols">
          <nav className="c-ft-marquee__col" aria-label="Sitemap">
            <h2 className="c-ft-marquee__ch">Menu</h2>
            <ul className="c-ft-marquee__list">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
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
              <a className="c-ft-marquee__contact" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <a className="c-ft-marquee__contact" href={site.phoneHref}>
                {site.phone}
              </a>
              <span className="c-ft-marquee__place">South London</span>
            </address>
            <ul className="c-ft-marquee__social" aria-label="Social">
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href={site.facebook} target="_blank" rel="noopener noreferrer">
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
          <a className="c-ft-marquee__top" href="#top">
            <span>Back to top</span>
            <span className="c-ft-marquee__top-arrow" aria-hidden="true">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

const css = `
.c-ft-marquee{
  --ft-marquee-dur: 34s;
  --ft-marquee-pad: clamp(28px, 6vw, 80px);
  display:block; width:100%;
  background:var(--background); color:var(--ink);
  font-family:var(--font-mono-stack);
  border-top:1px solid var(--line);
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
  max-width:1320px; margin:0 auto;
  padding:clamp(44px,6vw,72px) var(--ft-marquee-pad) clamp(26px,4vw,40px);
}
.c-ft-marquee__lead{
  display:flex; flex-wrap:wrap; align-items:flex-end;
  justify-content:space-between; gap:28px 40px;
  padding-bottom:clamp(36px,5vw,52px);
  border-bottom:1px solid var(--line);
}
.c-ft-marquee__wm{ margin:0 0 4px; }
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
.c-ft-marquee__list a,
.c-ft-marquee__contact,
.c-ft-marquee__social a{
  --ft-marquee-uh:0%;
  position:relative; display:inline-block;
  text-decoration:none; color:var(--ink);
  font-size:14px; line-height:1.4; letter-spacing:0.01em;
  background-image:linear-gradient(var(--copper),var(--copper));
  background-repeat:no-repeat;
  background-position:0 100%;
  background-size:var(--ft-marquee-uh) 1px;
  transition:background-size .38s cubic-bezier(.2,.7,.2,1), color .3s ease;
}
.c-ft-marquee__list a:hover,
.c-ft-marquee__contact:hover,
.c-ft-marquee__social a:hover{--ft-marquee-uh:100%; color:var(--copper-deep);}

.c-ft-marquee__addr{font-style:normal; display:flex; flex-direction:column; gap:11px; margin-bottom:22px;}
.c-ft-marquee__place{font-size:14px; color:var(--muted); letter-spacing:0.01em;}
.c-ft-marquee__social{display:flex; flex-wrap:wrap; gap:10px 22px;}
.c-ft-marquee__social a{font-size:13px;}

.c-ft-marquee__bar{
  display:flex; flex-wrap:wrap; align-items:center;
  gap:10px 28px; padding-top:clamp(22px,3vw,30px);
  border-top:1px solid var(--line);
}
.c-ft-marquee__legal{margin:0; font-size:12px; letter-spacing:0.01em; color:var(--muted);}
.c-ft-marquee__credit{ text-decoration:none; }
.c-ft-marquee__credit:hover{ color:var(--copper-deep); }
.c-ft-marquee__top{
  margin-left:auto; display:inline-flex; align-items:center; gap:8px;
  text-decoration:none; color:var(--ink); font-size:12px;
  letter-spacing:0.08em; text-transform:uppercase;
}
.c-ft-marquee__top-arrow{
  display:inline-flex; align-items:center; justify-content:center;
  width:26px; height:26px; border:1px solid var(--line); border-radius:50%;
  transition:transform .4s cubic-bezier(.2,.7,.2,1), border-color .3s ease, background .3s ease;
}
.c-ft-marquee__top:hover .c-ft-marquee__top-arrow{
  transform:translateY(-3px); border-color:var(--copper); background:var(--background);
}

.c-ft-marquee a:focus-visible{ outline:2px solid var(--slate-blue); outline-offset:4px; border-radius:1px; }

@media (max-width:860px){
  .c-ft-marquee__cols{grid-template-columns:repeat(2,minmax(0,1fr)); gap:36px 32px;}
  .c-ft-marquee__col--contact{grid-column:1 / -1;}
}
@media (max-width:560px){
  .c-ft-marquee__lead{align-items:flex-start;}
  .c-ft-marquee__cta{width:100%; justify-content:space-between;}
  .c-ft-marquee__cols{grid-template-columns:1fr;}
  .c-ft-marquee__bar{gap:14px;}
  .c-ft-marquee__top{margin-left:0;}
}

@media (prefers-reduced-motion:reduce){
  .c-ft-marquee__track{animation:none; transform:translate3d(-12%,0,0);}
  .c-ft-marquee__cta,
  .c-ft-marquee__cta-arrow,
  .c-ft-marquee__list a,
  .c-ft-marquee__contact,
  .c-ft-marquee__social a,
  .c-ft-marquee__top-arrow{transition:none;}
}
`;
