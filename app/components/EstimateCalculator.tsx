"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// Logic from site_plan/ESTIMATE_CALCULATOR_SPEC.md (the original Wix calculator).
// "None" options normalised to £0 (the original used £1 by quirk).

type Option = { label: string; value: number };

type Config = {
  rate: { label: string; hint?: string; options: Option[] };
  sqmLabel: string;
  adders: { label: string; options: Option[] }[];
};

const LOFT: Config = {
  rate: {
    label: "Type of conversion",
    hint: "Price per m² · includes 2 Velux windows",
    options: [
      { label: "Dormer", value: 1350 },
      { label: "Hip to Gable", value: 1600 },
      { label: "Velux", value: 1050 },
    ],
  },
  sqmLabel: "Floor area (m²)",
  adders: [
    {
      label: "Extra Velux windows",
      options: [
        { label: "None", value: 0 },
        { label: "1", value: 1000 },
        { label: "2", value: 2000 },
        { label: "3", value: 3000 },
      ],
    },
    {
      label: "Extra UPVC windows",
      options: [
        { label: "None", value: 0 },
        { label: "1", value: 1350 },
        { label: "2", value: 2000 },
        { label: "3", value: 2500 },
      ],
    },
    {
      label: "Bathroom",
      options: [
        { label: "None", value: 0 },
        { label: "Toilet / hand basin", value: 2000 },
        { label: "Shower room", value: 2800 },
        { label: "Full bathroom", value: 3800 },
      ],
    },
  ],
};

const EXTENSION: Config = {
  rate: {
    label: "Type of extension",
    hint: "Price per m²",
    options: [
      { label: "Single-storey rear", value: 3000 },
      { label: "Single-storey side", value: 3000 },
      { label: "Double-storey rear", value: 4500 },
      { label: "Double-storey side", value: 4500 },
      { label: "Single-storey wrap-around", value: 4500 },
    ],
  },
  sqmLabel: "Floor area (m²)",
  adders: [
    {
      label: "Doors",
      options: [
        { label: "None", value: 0 },
        { label: "Double French doors", value: 2500 },
        { label: "Sliding doors", value: 3500 },
        { label: "Bi-fold doors", value: 5000 },
      ],
    },
    {
      label: "Number of windows",
      options: [
        { label: "None", value: 0 },
        { label: "1", value: 1500 },
        { label: "2", value: 2000 },
        { label: "3", value: 2500 },
      ],
    },
  ],
};

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

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

const inputClass =
  "w-full appearance-none border-0 border-b border-tertiary bg-transparent py-3 text-lg outline-none";

// native <select> with the default arrow removed and our own chevron added, so
// it matches the editorial underline inputs
function Select({
  value,
  onChange,
  children,
}: {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={`${inputClass} pr-8`}>
        {children}
      </select>
      <span className="pointer-events-none absolute bottom-3 right-1 text-muted">
        ▾
      </span>
    </div>
  );
}

function Calculator({ config }: { config: Config }) {
  const [rate, setRate] = useState(config.rate.options[0].value);
  const [sqm, setSqm] = useState(30);
  const [adders, setAdders] = useState<number[]>(config.adders.map(() => 0));

  const total = useMemo(
    () => rate * sqm + adders.reduce((a, b) => a + b, 0),
    [rate, sqm, adders],
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
      <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
        <Field label={config.rate.label} hint={config.rate.hint}>
          <Select value={rate} onChange={(e) => setRate(Number(e.target.value))}>
            {config.rate.options.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={config.sqmLabel}>
          <input
            type="number"
            min={0}
            max={200}
            value={sqm}
            onChange={(e) =>
              setSqm(Math.min(200, Math.max(0, Number(e.target.value))))
            }
            className={inputClass}
          />
        </Field>

        {config.adders.map((adder, i) => (
          <Field key={adder.label} label={adder.label}>
            <Select
              value={adders[i]}
              onChange={(e) => {
                const next = [...adders];
                next[i] = Number(e.target.value);
                setAdders(next);
              }}
            >
              {adder.options.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        ))}
      </div>

      <div className="self-start lg:-mt-16 lg:sticky lg:top-24">
        <div className="border-t border-tertiary pt-6">
          <p className="label">Estimated cost</p>
          <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
            {gbp(total)}
          </p>
          <p className="mt-5 max-w-xs text-xs leading-relaxed text-muted">
            This is a guide based on typical rates, not a quote. For an accurate
            price we&apos;ll visit and assess your project.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-block font-mono text-sm uppercase tracking-[0.08em] link-underline"
          >
            Get an accurate quote
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EstimateCalculator() {
  const [mode, setMode] = useState<"loft" | "extension">("loft");

  return (
    <div>
      <div className="flex w-fit gap-6 border-b border-tertiary sm:gap-10">
        {(["loft", "extension"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`label relative pb-3 transition-colors ${
              mode === m ? "!text-ink" : "!text-muted hover:!text-ink"
            }`}
          >
            {m === "loft" ? "Loft conversion" : "Extension"}
            {mode === m && (
              <span className="absolute -bottom-px left-0 h-[3px] w-full bg-tertiary" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <Calculator config={mode === "loft" ? LOFT : EXTENSION} />
      </div>
    </div>
  );
}
