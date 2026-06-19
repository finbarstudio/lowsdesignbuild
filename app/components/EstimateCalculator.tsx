"use client";

import { useMemo, useState } from "react";

import { site } from "@/app/lib/site";

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

const ADVANCED = [
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
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label !text-ink text-base">{label}</span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      <div className="mt-3">{children}</div>
    </label>
  );
}

function Select({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  options: { label: string }[];
}) {
  return (
    <Field label={label} hint={hint}>
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
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))
        }
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
}: {
  email?: string;
}) {
  const [mode, setMode] = useState<"extension" | "loft">("extension");
  const [ext, setExt] = useState({ ...EXT0 });
  const [loft, setLoft] = useState({ ...LOFT0 });
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [partyWall, setPartyWall] = useState(0);
  const [finish, setFinish] = useState(0);
  const [showAdv, setShowAdv] = useState(false);
  const [sent, setSent] = useState(false);

  const setE = (k: keyof typeof ext, v: number) =>
    setExt((s) => ({ ...s, [k]: v }));
  const setL = (k: keyof typeof loft, v: number) =>
    setLoft((s) => ({ ...s, [k]: v }));

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

  function handleLead(e: React.FormEvent<HTMLFormElement>) {
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
    const subject = encodeURIComponent(`Budget calculator enquiry — ${name}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <div>
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

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
        {/* ---- inputs ---- */}
        <div className="space-y-12">
          {mode === "extension" ? (
            <>
              <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
                <Select label="Extension type" value={ext.type} onChange={(v) => setE("type", v)} options={EXT_TYPES} />
                <NumberField label="Extension size" hint="Total floor area in m²" value={ext.size} onChange={(v) => setE("size", v)} max={500} />
                <Select label="Structural opening" value={ext.opening} onChange={(v) => setE("opening", v)} options={OPENINGS} />
                <Select label="Roof type" value={ext.roof} onChange={(v) => setE("roof", v)} options={ROOFS} />
                <Select label="Glazing package" value={ext.glazing} onChange={(v) => setE("glazing", v)} options={GLAZING} />
                <Select label="Utility room" value={ext.utility} onChange={(v) => setE("utility", v)} options={UTILITY} />
                <Select label="Underfloor heating" value={ext.ufh} onChange={(v) => setE("ufh", v)} options={UFH} />
                <Select label="Site access" value={ext.access} onChange={(v) => setE("access", v)} options={ACCESS} />
                <Select label="Construction complexity" value={ext.complexity} onChange={(v) => setE("complexity", v)} options={COMPLEXITY} />
              </div>
              <div>
                <p className="label !text-ink mb-5">Bathrooms</p>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-3">
                  <NumberField label="WCs" value={ext.wc} onChange={(v) => setE("wc", v)} max={20} />
                  <NumberField label="Ensuites" value={ext.ensuite} onChange={(v) => setE("ensuite", v)} max={20} />
                  <NumberField label="Bathrooms" value={ext.bathroom} onChange={(v) => setE("bathroom", v)} max={20} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
                <Select label="Loft type" value={loft.type} onChange={(v) => setL("type", v)} options={LOFT_TYPES} />
                <Select label="Bedrooms created" value={loft.bedrooms} onChange={(v) => setL("bedrooms", v)} options={BEDROOMS} />
                <Select label="Staircase" value={loft.staircase} onChange={(v) => setL("staircase", v)} options={STAIRCASE} />
                <Select label="Built-in joinery" value={loft.joinery} onChange={(v) => setL("joinery", v)} options={JOINERY} />
                <Select label="Air conditioning" value={loft.ac} onChange={(v) => setL("ac", v)} options={AC} />
                <Select label="Chimney works" value={loft.chimney} onChange={(v) => setL("chimney", v)} options={CHIMNEY} />
                <Select label="Steel complexity" value={loft.steel} onChange={(v) => setL("steel", v)} options={STEEL} />
              </div>
              <div>
                <p className="label !text-ink mb-5">Ensuites</p>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
                  <NumberField label="Standard ensuites" value={loft.ensuiteStd} onChange={(v) => setL("ensuiteStd", v)} max={20} />
                  <NumberField label="Premium ensuites" value={loft.ensuitePrem} onChange={(v) => setL("ensuitePrem", v)} max={20} />
                </div>
              </div>
              <div>
                <p className="label !text-ink mb-5">Rooflights</p>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-3">
                  <NumberField label="Standard" value={loft.rlStd} onChange={(v) => setL("rlStd", v)} max={30} />
                  <NumberField label="Premium" value={loft.rlPrem} onChange={(v) => setL("rlPrem", v)} max={30} />
                  <NumberField label="Cabrio balcony" value={loft.rlCabrio} onChange={(v) => setL("rlCabrio", v)} max={30} />
                </div>
              </div>
            </>
          )}

          {/* ---- finish + advanced factors ---- */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
            <Select label="Finish level" value={finish} onChange={setFinish} options={FINISH} />
          </div>

          <div className="border-t border-line pt-8">
            <button
              type="button"
              onClick={() => setShowAdv((v) => !v)}
              className="label !text-ink flex items-center gap-2"
            >
              Advanced project factors
              <span className="text-muted">{showAdv ? "–" : "+"}</span>
            </button>
            <p className="mt-2 text-xs text-muted">
              Optional — planning, logistics, services and structural extras.
            </p>

            {showAdv && (
              <div className="mt-7 space-y-8">
                <div className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
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
                      <span>
                        {a.label}{" "}
                        <span className="text-muted">(+{gbp(a.add)})</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
                  <NumberField
                    label="Party wall — adjoining neighbours"
                    hint="£3,000 per neighbour"
                    value={partyWall}
                    onChange={setPartyWall}
                    max={10}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- result ---- */}
        <div className="self-start lg:-mt-16 lg:sticky lg:top-24">
          <div className="border-t border-tertiary pt-6">
            <p className="label">Estimated budget range</p>
            <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {gbp(lower)} – {gbp(upper)}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              This estimate is intended as a budget guide only and is not a
              formal quotation. Final costs will depend on site conditions,
              design development, planning requirements and specification
              choices.
            </p>
          </div>
        </div>
      </div>

      {/* ---- lead capture ---- */}
      <div className="mt-16 border-t border-line pt-12 sm:mt-24">
        <p className="label !text-ink">Get your detailed estimate</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Send us your details and project and we&apos;ll follow up with a
          tailored breakdown and next steps.
        </p>

        <form onSubmit={handleLead} className="mt-10 max-w-3xl space-y-9">
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <Field label="First name">
              <input name="firstName" required placeholder="Jane" className={inputClass} />
            </Field>
            <Field label="Last name">
              <input name="lastName" required placeholder="Low" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <Field label="Email">
              <input name="email" type="email" required placeholder="jane@email.com" className={inputClass} />
            </Field>
            <Field label="Phone">
              <input name="phone" required placeholder="07…" className={inputClass} />
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

          {/* same link-underline token as every other link on the site */}
          <button type="submit" className="link-underline w-fit text-base">
            Send my details →
          </button>

          {sent && (
            <p className="text-sm text-muted">
              Thanks. Your email app should have opened with your enquiry ready
              to send. If not, email us at {email}.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
