import type { SanityPalette } from "@/sanity/lib/types";

export type Swatch = { hex: string; name: string };

// Perceptual-ish luminance (0–1) for ordering swatches into a gradient.
export function lum(hex: string): number {
  const m = hex.replace("#", "");
  const f = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(f.slice(0, 2), 16) / 255;
  const g = parseInt(f.slice(2, 4), 16) / 255;
  const b = parseInt(f.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Lighten (amt>0) / darken (amt<0) a hex by a fraction.
export function shade(hex: string, amt: number): string {
  const m = hex.replace("#", "");
  const f = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const ch = (i: number) => {
    const v = parseInt(f.slice(i, i + 2), 16);
    const next = amt >= 0 ? v + (255 - v) * amt : v * (1 + amt);
    return Math.max(0, Math.min(255, Math.round(next)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

// Guarantee at least 3 tiles by padding with tints/shades of what we have.
export function ensureMin3(colours: Swatch[]): Swatch[] {
  if (colours.length === 0) return colours;
  const out = [...colours];
  let i = 0;
  while (out.length < 3) {
    const base = colours[i % colours.length].hex;
    out.push({ hex: shade(base, i % 2 === 0 ? 0.2 : -0.2), name: "" });
    i++;
  }
  return out;
}

// The project's colours: the CMS palette if set, otherwise auto-derived from the
// hero image's palette metadata, ordered dark→light into a gradient.
export function deriveColours(
  palette: Array<{ color: string | null; name: string | null }> | null,
  heroPalette: SanityPalette | null,
): Swatch[] {
  if (palette && palette.length > 0) {
    return ensureMin3(
      palette
        .filter((p) => p.color)
        .map((p) => ({ hex: p.color as string, name: p.name || "" })),
    );
  }
  if (!heroPalette) return [];
  const keys = [
    "darkMuted",
    "darkVibrant",
    "muted",
    "dominant",
    "vibrant",
    "lightMuted",
    "lightVibrant",
  ] as const;
  const seen = new Set<string>();
  const hexes: string[] = [];
  for (const k of keys) {
    const bg = heroPalette[k]?.background;
    if (bg && !seen.has(bg.toLowerCase())) {
      seen.add(bg.toLowerCase());
      hexes.push(bg);
    }
  }
  return ensureMin3(
    hexes
      .sort((a, b) => lum(a) - lum(b))
      .slice(0, 5)
      .map((hex) => ({ hex, name: "" })),
  );
}
