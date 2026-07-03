"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { site } from "@/app/lib/site";
import { FORM_CARD } from "@/app/lib/ui";
import { submitEnquiry } from "@/app/lib/submitEnquiry";

/**
 * London Loft Conversion & Extension budget calculator. Fully client-side and
 * self-contained — no external service. Produces an indicative budget *range*
 * (±10%), not a quotation, and captures a qualified lead via mailto.
 *
 * All rates/figures come straight from the brief and live in the config tables
 * below, so they're easy to adjust.
 */

// ---- config ---------------------------------------------------------------

type Opt = { label: string; add: number };

const EXT_TYPES = [
  { label: "Rear Extension", rate: 3000, min: 80000 },
  { label: "Side Return", rate: 3200, min: 85000 },
  { label: "Wraparound Extension", rate: 3400, min: 95000 },
  { label: "Double Storey Extension", rate: 4000, min: 130000 },
];

const OPENINGS: Opt[] = [
  { label: "Standard opening", add: 0 },
  { label: "Large opening", add: 7500 },
  { label: "Full width opening", add: 15000 },
];
const ROOFS: Opt[] = [
  { label: "Flat roof", add: 0 },
  { label: "Flat roof with lantern", add: 5000 },
  { label: "Pitched roof", add: 12000 },
  { label: "Vaulted ceiling", add: 15000 },
  { label: "Complex roof design", add: 25000 },
];
const GLAZING: Opt[] = [
  { label: "Standard doors & windows", add: 0 },
  { label: "Bifold / sliding door package", add: 7500 },
  { label: "Premium large-span glazing", add: 15000 },
];
const UTILITY: Opt[] = [
  { label: "No", add: 0 },
  { label: "Yes", add: 4000 },
];
const UFH: Opt[] = [
  { label: "No", add: 0 },
  { label: "Part of extension", add: 3000 },
  { label: "Whole extension", add: 6000 },
];
const ACCESS: Opt[] = [
  { label: "Good access", add: 0 },
  { label: "Restricted side access", add: 5000 },
  { label: "No side access", add: 10000 },
];
const COMPLEXITY: Opt[] = [
  { label: "Standard", add: 0 },
  { label: "Moderate complexity", add: 10000 },
  { label: "High complexity", add: 20000 },
];

const LOFT_TYPES = [
  { label: "Velux Loft", base: 75000 },
  { label: "Rear Dormer Loft", base: 100000 },
  { label: "Hip-to-Gable + Rear Dormer", base: 120000 },
  { label: "L-Shaped Dormer", base: 130000 },
  { label: "Mansard Loft", base: 150000 },
];
const BEDROOMS: Opt[] = [
  { label: "1 bedroom", add: 0 },
  { label: "2 bedrooms", add: 10000 },
  { label: "3 bedrooms", add: 20000 },
];
const STAIRCASE: Opt[] = [
  { label: "Standard staircase", add: 0 },
  { label: "Feature staircase", add: 5000 },
  { label: "Bespoke staircase", add: 10000 },
];
const JOINERY: Opt[] = [
  { label: "None", add: 0 },
  { label: "Wardrobe package", add: 5000 },
  { label: "Premium bespoke joinery", add: 10000 },
];
const AC: Opt[] = [
  { label: "No", add: 0 },
  { label: "Yes", add: 5000 },
];
const CHIMNEY: Opt[] = [
  { label: "No changes", add: 0 },
  { label: "Partial alterations", add: 5000 },
  { label: "Removal", add: 10000 },
];
const STEEL: Opt[] = [
  { label: "Standard", add: 0 },
  { label: "Moderate", add: 7500 },
  { label: "High", add: 15000 },
];

const FINISH = [
  { label: "Standard finish", pct: 0 },
  { label: "High-end finish (+10%)", pct: 0.1 },
  { label: "Luxury finish (+20%)", pct: 0.2 },
];

const ADVANCED: { key: string; label: string; add: number }[] = [
  { key: "conservation", label: "Conservation area", add: 5000 },
  { key: "article4", label: "Article 4 restriction area", add: 5000 },
  { key: "skip", label: "Skip permit required", add: 1500 },
  { key: "parking", label: "Parking suspension required", add: 2000 },
  { key: "logistics", label: "Difficult site logistics", add: 5000 },
  { key: "smartHome", label: "Smart home package", add: 5000 },
  { key: "premElec", label: "Premium electrical package", add: 5000 },
  { key: "rewire", label: "Full house rewire included", add: 10000 },
  { key: "heating", label: "Heating system upgrade", add: 8000 },
  { key: "boiler", label: "Boiler upgrade", add: 4000 },
  { key: "ashp", label: "ASHP installation interface", add: 10000 },
  { key: "basement", label: "Basement interface / structural tie-in", add: 15000 },
  { key: "drainage", label: "Complex drainage diversion", add: 10000 },
  { key: "sewer", label: "Build over public sewer", add: 5000 },
  { key: "largeSteel", label: "Large structural steel package", add: 10000 },
  { key: "complexSteel", label: "Complex structural steel package", add: 20000 },
];

// Built-in tooltip copy for a few fields. The CMS can override any of these and
// add tooltips to fields not listed here (see app/lib/estimateInfoFields.ts for
// the full set of keys). A field with no default and no CMS text shows no icon.
const DEFAULT_INFO: Record<string, string> = {
  finish:
    "Standard is a quality, functional finish. High-end adds 10% for premium materials and detailing; luxury adds 20% for bespoke, top-tier specification throughout.",
  complexity:
    "Reflects how involved the build is — awkward layouts, structural challenges or phasing push this from standard to moderate or high.",
  steel:
    "How much structural steelwork the design needs — larger spans and multiple beams increase complexity.",
  opening:
    "The opening between the existing house and the new space — wider, full-width openings need more steel support.",
  access:
    "How easily materials and skips can reach the work area. Restricted or no side access adds labour and time.",
  conservation:
    "Stricter planning controls and material requirements apply in a designated conservation area.",
  article4:
    "An Article 4 Direction removes permitted-development rights, so works need full planning permission.",
  ashp: "Allowing for connection and interface with an air-source heat pump system.",
  basement:
    "Structural tie-in where the works connect to or sit above an existing basement.",
  drainage: "Rerouting existing drainage runs that clash with the new structure.",
  sewer:
    "A build-over agreement with the water authority where the structure sits over a public sewer.",
  partyWall:
    "A Party Wall agreement is needed when you build on or near a shared boundary; each adjoining neighbour usually needs their own award.",
};

const TIMESCALES = [
  "ASAP",
  "Within 3 months",
  "Within 6 months",
  "Within 12 months",
  "Just researching",
];
const ALIGNMENTS = [
  "Yes",
  "Slightly higher than expected",
  "Much higher than expected",
  "Lower than expected",
];

// ---- helpers --------------------------------------------------------------

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const inputClass =
  "w-full appearance-none border-0 border-b border-tertiary bg-transparent py-3 text-lg outline-none";

function Field({
  label,
  hint,
  info,
  children,
}: {
  label: string;
  hint?: string;
  info?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {/* field title sits a level below the section headings (sentence case,
          smaller) so it never clashes with a group title like "Bathrooms" */}
      {/* label, info icon and hint all on one line so every field's input row
          lines up with its siblings regardless of whether it has a hint */}
      <span className="flex items-center text-sm font-semibold tracking-tight text-ink">
        {label}
        {info && <InfoTip text={info} />}
        {hint && (
          <span className="ml-2 text-xs font-normal text-muted">{hint}</span>
        )}
      </span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

// An info icon that reveals an explanation on hover (desktop) and on tap
// (mobile) — tapping toggles it, since touch devices have no hover.
function InfoTip({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <span className="relative ml-1.5 inline-flex align-middle">
      <button
        type="button"
        aria-label="More information"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="block text-muted transition-colors hover:text-tertiary"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-[1.1em] w-[1.1em]"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.25" />
          <path d="M12 11.25v5" strokeLinecap="round" />
          <circle cx="12" cy="7.75" r="1.05" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <span
        className={`absolute bottom-full left-0 z-30 mb-2 w-60 rounded bg-ink px-3 py-2 text-xs font-normal normal-case leading-relaxed text-background shadow-xl transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {text}
      </span>
    </span>
  );
}

function Select({
  label,
  hint,
  info,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  info?: string;
  value: number;
  onChange: (v: number) => void;
  options: { label: string }[];
}) {
  return (
    <Field label={label} hint={hint} info={info}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${inputClass} pr-8`}
        >
          {options.map((o, i) => (
            <option key={o.label} value={i}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute bottom-3 right-1 text-muted">
          ▾
        </span>
      </div>
    </Field>
  );
}

function NumberField({
  label,
  hint,
  info,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  hint?: string;
  info?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  // keep a raw string so the field can be cleared/edited freely (a plain
  // controlled number snaps empties to 0 and won't let you delete a digit)
  const [raw, setRaw] = useState(String(value));
  useEffect(() => {
    setRaw((r) => (Number(r) === value ? r : String(value)));
  }, [value]);

  return (
    <Field label={label} hint={hint} info={info}>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          setRaw(v);
          if (v === "") return; // allow empty while typing
          const n = Number(v);
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        onBlur={() => {
          const n = Number(raw);
          if (raw === "" || Number.isNaN(n)) {
            setRaw(String(min));
            onChange(min);
          } else {
            const clamped = Math.min(max, Math.max(min, n));
            setRaw(String(clamped));
            onChange(clamped);
          }
        }}
        className={inputClass}
      />
    </Field>
  );
}

// ---- state shapes ---------------------------------------------------------

const EXT0 = {
  type: 0,
  size: 30,
  opening: 0,
  roof: 0,
  glazing: 0,
  wc: 0,
  ensuite: 0,
  bathroom: 1,
  utility: 0,
  ufh: 0,
  access: 0,
  complexity: 0,
};
const LOFT0 = {
  type: 1,
  bedrooms: 0,
  ensuiteStd: 1,
  ensuitePrem: 0,
  rlStd: 2,
  rlPrem: 0,
  rlCabrio: 0,
  staircase: 0,
  joinery: 0,
  ac: 0,
  chimney: 0,
  steel: 0,
};

export default function EstimateCalculator({
  email = site.email,
  accessKey,
  infoOverrides,
}: {
  email?: string;
  /** Web3Forms access key — when set, the lead is emailed directly (not mailto) */
  accessKey?: string;
  /** CMS-editable tooltip copy keyed by field; falls back to DEFAULT_INFO */
  infoOverrides?: Record<string, string>;
}) {
  // tooltip text for a key: CMS override (if non-empty) → built-in default
  const info = (k: string) => infoOverrides?.[k]?.trim() || DEFAULT_INFO[k] || "";

  const [mode, setMode] = useState<"extension" | "loft">("extension");
  const [ext, setExt] = useState({ ...EXT0 });
  const [loft, setLoft] = useState({ ...LOFT0 });
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [partyWall, setPartyWall] = useState(0);
  const [finish, setFinish] = useState(0);
  const [showAdv, setShowAdv] = useState(false);
  const [sent, setSent] = useState<"" | "sent" | "mailto">("");
  const formRef = useRef<HTMLDivElement>(null);

  // hide the "Get your estimate" jump-to-form button once the form is reached
  // (it's redundant by then); show it again when scrolling back up to the calc
  const [atForm, setAtForm] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const el = formRef.current;
      if (!el) return;
      setAtForm(el.getBoundingClientRect().top < window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const setE = (k: keyof typeof ext, v: number) =>
    setExt((s) => ({ ...s, [k]: v }));
  const setL = (k: keyof typeof loft, v: number) =>
    setLoft((s) => ({ ...s, [k]: v }));

  function scrollToForm() {
    const el = formRef.current;
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: { offset?: number; duration?: number }) => void } }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const { estimate, lower, upper } = useMemo(() => {
    let core: number;
    if (mode === "extension") {
      const t = EXT_TYPES[ext.type];
      const base = (ext.size || 0) * t.rate;
      core =
        base +
        OPENINGS[ext.opening].add +
        ROOFS[ext.roof].add +
        GLAZING[ext.glazing].add +
        ext.wc * 4000 +
        ext.ensuite * 8000 +
        ext.bathroom * 10000 +
        UTILITY[ext.utility].add +
        UFH[ext.ufh].add +
        ACCESS[ext.access].add +
        COMPLEXITY[ext.complexity].add;
      core = Math.max(core, t.min); // minimum project value floor
    } else {
      core =
        LOFT_TYPES[loft.type].base +
        BEDROOMS[loft.bedrooms].add +
        loft.ensuiteStd * 8000 +
        loft.ensuitePrem * 12000 +
        loft.rlStd * 2000 +
        loft.rlPrem * 3500 +
        loft.rlCabrio * 6000 +
        STAIRCASE[loft.staircase].add +
        JOINERY[loft.joinery].add +
        AC[loft.ac].add +
        CHIMNEY[loft.chimney].add +
        STEEL[loft.steel].add;
    }

    let flat = partyWall * 3000;
    for (const a of ADVANCED) if (toggles[a.key]) flat += a.add;

    const subtotal = core + flat;
    const est = Math.round(subtotal * (1 + FINISH[finish].pct));
    return {
      estimate: est,
      lower: Math.round(est * 0.9),
      upper: Math.round(est * 1.1),
    };
  }, [mode, ext, loft, toggles, partyWall, finish]);

  function projectSummary() {
    const lines: string[] = [];
    if (mode === "extension") {
      lines.push(`Project: ${EXT_TYPES[ext.type].label}`);
      lines.push(`Size: ${ext.size} m²`);
      lines.push(`Opening: ${OPENINGS[ext.opening].label}`);
      lines.push(`Roof: ${ROOFS[ext.roof].label}`);
      lines.push(`Glazing: ${GLAZING[ext.glazing].label}`);
      lines.push(`WCs: ${ext.wc}, Ensuites: ${ext.ensuite}, Bathrooms: ${ext.bathroom}`);
      lines.push(`Utility room: ${UTILITY[ext.utility].label}`);
      lines.push(`Underfloor heating: ${UFH[ext.ufh].label}`);
      lines.push(`Access: ${ACCESS[ext.access].label}`);
      lines.push(`Complexity: ${COMPLEXITY[ext.complexity].label}`);
    } else {
      lines.push(`Project: ${LOFT_TYPES[loft.type].label}`);
      lines.push(`Bedrooms: ${BEDROOMS[loft.bedrooms].label}`);
      lines.push(`Ensuites — standard: ${loft.ensuiteStd}, premium: ${loft.ensuitePrem}`);
      lines.push(
        `Rooflights — standard: ${loft.rlStd}, premium: ${loft.rlPrem}, cabrio: ${loft.rlCabrio}`,
      );
      lines.push(`Staircase: ${STAIRCASE[loft.staircase].label}`);
      lines.push(`Joinery: ${JOINERY[loft.joinery].label}`);
      lines.push(`Air conditioning: ${AC[loft.ac].label}`);
      lines.push(`Chimney: ${CHIMNEY[loft.chimney].label}`);
      lines.push(`Steel complexity: ${STEEL[loft.steel].label}`);
    }
    const adv = ADVANCED.filter((a) => toggles[a.key]).map((a) => a.label);
    if (partyWall > 0) adv.push(`Party wall × ${partyWall}`);
    lines.push(`Finish level: ${FINISH[finish].label}`);
    if (adv.length) lines.push(`Advanced factors: ${adv.join(", ")}`);
    return lines.join("\n");
  }

  async function handleLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = `${d.get("firstName")} ${d.get("lastName")}`.trim();
    const body = [
      `Name: ${name}`,
      `Email: ${d.get("email")}`,
      `Phone: ${d.get("phone")}`,
      `Postcode: ${d.get("postcode")}`,
      `Timescale: ${d.get("timescale")}`,
      `Budget alignment: ${d.get("alignment")}`,
      "",
      `Estimated budget range: ${gbp(lower)} – ${gbp(upper)}`,
      "",
      projectSummary(),
    ].join("\n");
    const result = await submitEnquiry({
      accessKey,
      recipient: email,
      replyTo: String(d.get("email") || ""),
      subject: `Budget calculator enquiry — ${name}`,
      message: body,
    });
    setSent(result === "failed" ? "mailto" : result);
  }

  return (
    <div>
      {/* ---- card 1: the calculator itself ---- */}
      <div className={FORM_CARD}>
      {/* mode tabs */}
      <div className="flex w-fit gap-6 border-b border-tertiary sm:gap-10">
        {(["extension", "loft"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`label relative pb-3 transition-colors ${
              mode === m ? "!text-ink" : "!text-muted hover:!text-ink"
            }`}
          >
            {m === "extension" ? "Extension" : "Loft conversion"}
            {mode === m && (
              <span className="absolute -bottom-px left-0 h-[3px] w-full bg-tertiary" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:gap-x-16">
        {/* ---- inputs (col 1, row 1) ---- */}
        <div className="order-1 space-y-12 lg:col-start-1 lg:row-start-1">
          {mode === "extension" ? (
            <>
              <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                <Select label="Extension type" info={info("extType")} value={ext.type} onChange={(v) => setE("type", v)} options={EXT_TYPES} />
                <NumberField label="Extension size" hint="Total floor area in m²" info={info("extSize")} value={ext.size} onChange={(v) => setE("size", v)} max={500} />
                <Select label="Structural opening" info={info("opening")} value={ext.opening} onChange={(v) => setE("opening", v)} options={OPENINGS} />
                <Select label="Roof type" info={info("roof")} value={ext.roof} onChange={(v) => setE("roof", v)} options={ROOFS} />
                <Select label="Glazing package" info={info("glazing")} value={ext.glazing} onChange={(v) => setE("glazing", v)} options={GLAZING} />
                <Select label="Utility room" info={info("utility")} value={ext.utility} onChange={(v) => setE("utility", v)} options={UTILITY} />
                <Select label="Underfloor heating" info={info("ufh")} value={ext.ufh} onChange={(v) => setE("ufh", v)} options={UFH} />
                <Select label="Site access" info={info("access")} value={ext.access} onChange={(v) => setE("access", v)} options={ACCESS} />
                <Select label="Construction complexity" info={info("complexity")} value={ext.complexity} onChange={(v) => setE("complexity", v)} options={COMPLEXITY} />
              </div>
              <div>
                <p className="label !text-ink mb-5">Bathrooms</p>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-3">
                  <NumberField label="WCs" info={info("wc")} value={ext.wc} onChange={(v) => setE("wc", v)} max={20} />
                  <NumberField label="Ensuites" info={info("extEnsuite")} value={ext.ensuite} onChange={(v) => setE("ensuite", v)} max={20} />
                  <NumberField label="Bathrooms" info={info("bathroom")} value={ext.bathroom} onChange={(v) => setE("bathroom", v)} max={20} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                <Select label="Loft type" info={info("loftType")} value={loft.type} onChange={(v) => setL("type", v)} options={LOFT_TYPES} />
                <Select label="Bedrooms created" info={info("bedrooms")} value={loft.bedrooms} onChange={(v) => setL("bedrooms", v)} options={BEDROOMS} />
                <Select label="Staircase" info={info("staircase")} value={loft.staircase} onChange={(v) => setL("staircase", v)} options={STAIRCASE} />
                <Select label="Built-in joinery" info={info("joinery")} value={loft.joinery} onChange={(v) => setL("joinery", v)} options={JOINERY} />
                <Select label="Air conditioning" info={info("ac")} value={loft.ac} onChange={(v) => setL("ac", v)} options={AC} />
                <Select label="Chimney works" info={info("chimney")} value={loft.chimney} onChange={(v) => setL("chimney", v)} options={CHIMNEY} />
                <Select label="Steel complexity" info={info("steel")} value={loft.steel} onChange={(v) => setL("steel", v)} options={STEEL} />
              </div>
              <div>
                <p className="label !text-ink mb-5">Ensuites</p>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
                  <NumberField label="Standard ensuites" info={info("ensuiteStd")} value={loft.ensuiteStd} onChange={(v) => setL("ensuiteStd", v)} max={20} />
                  <NumberField label="Premium ensuites" info={info("ensuitePrem")} value={loft.ensuitePrem} onChange={(v) => setL("ensuitePrem", v)} max={20} />
                </div>
              </div>
              <div>
                <p className="label !text-ink mb-5">Rooflights</p>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-3">
                  <NumberField label="Standard" info={info("rlStd")} value={loft.rlStd} onChange={(v) => setL("rlStd", v)} max={30} />
                  <NumberField label="Premium" info={info("rlPrem")} value={loft.rlPrem} onChange={(v) => setL("rlPrem", v)} max={30} />
                  <NumberField label="Cabrio balcony" info={info("rlCabrio")} value={loft.rlCabrio} onChange={(v) => setL("rlCabrio", v)} max={30} />
                </div>
              </div>
            </>
          )}

          {/* ---- finish + advanced factors ---- */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
            <Select
              label="Finish level"
              info={info("finish")}
              value={finish}
              onChange={setFinish}
              options={FINISH}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdv((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink"
            >
              Advanced project factors
              <span className="font-mono text-base leading-none text-tertiary">
                {showAdv ? "–" : "+"}
              </span>
            </button>
            <p className="mt-1 text-xs text-muted">
              Optional — planning, logistics, services and structural extras.
            </p>

            {showAdv && (
              <div className="mt-7 space-y-8">
                <div className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ADVANCED.map((a) => (
                    <label key={a.key} className="flex cursor-pointer items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(toggles[a.key])}
                        onChange={(e) =>
                          setToggles((s) => ({ ...s, [a.key]: e.target.checked }))
                        }
                        className="h-4 w-4 shrink-0 accent-[var(--tertiary)]"
                      />
                      <span className="flex items-center">
                        {a.label}
                        <span className="ml-1 text-muted">(+{gbp(a.add)})</span>
                        <InfoTip text={info(a.key)} />
                      </span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
                  <NumberField
                    label="Party wall — adjoining neighbours"
                    hint="£3,000 per neighbour"
                    info={info("partyWall")}
                    value={partyWall}
                    onChange={setPartyWall}
                    max={10}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- result — col 2, sticky beside the inputs. On mobile it sits
            below them (the lead form is its own card further down). ---- */}
        <div className="order-2 self-start lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
          <div className="border-t border-tertiary pt-6">
            <p className="label !text-tertiary">Estimated budget range</p>
            <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {gbp(lower)} – {gbp(upper)}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              This estimate is intended as a budget guide only and is not a
              formal quotation. Final costs will depend on site conditions,
              design development, planning requirements and specification
              choices.
            </p>
            <span className="mt-7 hidden overflow-hidden sm:block">
              <button
                type="button"
                onClick={scrollToForm}
                aria-hidden={atForm}
                tabIndex={atForm ? -1 : 0}
                style={{ transform: atForm ? "translateY(160%)" : "translateY(0)" }}
                className="link link-underline is-tracked block w-fit transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
              >
                Get your estimate
              </button>
            </span>
          </div>
        </div>
      </div>
      </div>

      {/* ---- card 2: the detailed-estimate lead form, its own card ---- */}
      <div ref={formRef} className={`${FORM_CARD} mt-8 sm:mt-10`}>
            <p className="label !text-ink">Get your detailed estimate</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Send us your details and project and we&apos;ll follow up with a
              tailored breakdown and next steps.
            </p>

            <form onSubmit={handleLead} className="mt-10 max-w-3xl space-y-9">
              <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <Field label="First name">
                  <input name="firstName" required placeholder="John" className={inputClass} />
                </Field>
                <Field label="Last name">
                  <input name="lastName" required placeholder="Smith" className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <Field label="Email">
                  <input name="email" type="email" required placeholder="john@email.com" className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input name="phone" placeholder="Optional" className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <Field label="Project postcode">
                  <input name="postcode" required placeholder="SE1…" className={inputClass} />
                </Field>
                <Field label="Project timescale">
                  <div className="relative">
                    <select name="timescale" defaultValue={TIMESCALES[0]} className={`${inputClass} pr-8`}>
                      {TIMESCALES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute bottom-3 right-1 text-muted">▾</span>
                  </div>
                </Field>
              </div>
              <Field label="Does this budget align with your expectations?">
                <div className="relative">
                  <select name="alignment" defaultValue={ALIGNMENTS[0]} className={`${inputClass} pr-8`}>
                    {ALIGNMENTS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute bottom-3 right-1 text-muted">▾</span>
                </div>
              </Field>

              {/* shared link token (Space Mono, uppercase) */}
              <button type="submit" className="link link-underline is-tracked w-fit">
                Send my details
              </button>

              {sent === "sent" && (
                <p className="text-sm text-muted">
                  Thanks — your enquiry and estimate are on their way to us.
                  We&apos;ll be in touch shortly.
                </p>
              )}
              {sent === "mailto" && (
                <p className="text-sm text-muted">
                  Thanks. Your email app should have opened with your enquiry
                  ready to send. If not, email us at {email}.
                </p>
              )}
            </form>
        </div>

    </div>
  );
}
