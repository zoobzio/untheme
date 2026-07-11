/**
 * Regenerates the tonal ramps from scripts/seeds.json: the base ramps into
 * src/ramps.ts, and one variant layer per theme into src/themes/<id>.ts.
 * Each seed contributes its hue and chroma; every ramp shares one OKLCH
 * lightness ladder across the eleven Tailwind-style stops (50–950), with a
 * chroma curve that peaks at the middle and tapers toward both ends. The
 * accent ramps additionally emit muted and vivid chroma columns for the
 * vibrancy axis; the neutral ramps are exempt. Out of gamut colors reduce
 * chroma until sRGB can hold them. Run with `pnpm generate && pnpm format`.
 */
import { readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

/**
 * The shared lightness ladder and chroma curve: per stop, the OKLCH
 * lightness every ramp lands on, and the multiplier applied to the seed's
 * chroma.
 */
/**
 * The chroma columns: every ramp carries the balanced column; accent ramps
 * add muted and vivid columns at the same lightness ladder. The neutral
 * ramps stay single-column — muting a neutral is a theme, not an axis.
 */
const NEUTRAL_RAMPS = new Set(["neutral", "neutral-variant"]);

const COLUMNS = [
  { suffix: "", chroma: 1 },
  { suffix: "-muted", chroma: 0.45 },
  { suffix: "-vivid", chroma: 1.4 },
];

const STOPS = {
  50: { lightness: 0.975, chroma: 0.22 },
  100: { lightness: 0.945, chroma: 0.38 },
  200: { lightness: 0.885, chroma: 0.6 },
  300: { lightness: 0.805, chroma: 0.82 },
  400: { lightness: 0.715, chroma: 0.95 },
  500: { lightness: 0.62, chroma: 1 },
  600: { lightness: 0.53, chroma: 1 },
  700: { lightness: 0.45, chroma: 0.94 },
  800: { lightness: 0.375, chroma: 0.84 },
  900: { lightness: 0.3, chroma: 0.7 },
  950: { lightness: 0.245, chroma: 0.55 },
};

/* ── sRGB ↔ OKLCH ────────────────────────────────────────────────────── */

const linear = (channel) => {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return ((channel + 0.055) / 1.055) ** 2.4;
};

const gamma = (channel) => {
  if (channel <= 0.0031308) {
    return 12.92 * channel;
  }
  return 1.055 * channel ** (1 / 2.4) - 0.055;
};

/**
 * A hex color's OKLCH coordinates. Only hue and chroma are consumed — the
 * ladder supplies lightness — but all three come back for completeness.
 */
const oklch = (hex) => {
  const [r, g, b] = [1, 3, 5].map((at) => {
    return linear(Number.parseInt(hex.slice(at, at + 2), 16) / 255);
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    lightness,
    chroma: Math.hypot(a, b2),
    hue: Math.atan2(b2, a),
  };
};

/**
 * OKLCH coordinates as sRGB channels in [0, 1], or null when the color
 * falls outside the sRGB gamut.
 */
const srgb = ({ lightness, chroma, hue }) => {
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(gamma);
  if (channels.some((channel) => channel < -0.0001 || channel > 1.0001)) {
    return null;
  }
  return channels.map((channel) => Math.min(1, Math.max(0, channel)));
};

/**
 * The nearest in-gamut sRGB channels for the coordinates: chroma reduces —
 * lightness and hue hold — until sRGB can express the color.
 */
const fit = ({ lightness, chroma, hue }) => {
  const direct = srgb({ lightness, chroma, hue });
  if (direct) {
    return direct;
  }
  let low = 0;
  let high = chroma;
  let best = srgb({ lightness, chroma: 0, hue });
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2;
    const attempt = srgb({ lightness, chroma: middle, hue });
    if (attempt) {
      best = attempt;
      low = middle;
    } else {
      high = middle;
    }
  }
  return best;
};

/* ── emission ────────────────────────────────────────────────────────── */

/**
 * A stop's structured color from its sRGB channels: five-decimal
 * components with the lowercase hex fallback — the pairing the test
 * suite's hex ↔ components agreement check enforces.
 */
const color = (channels) => {
  const bytes = channels.map((channel) => Math.round(channel * 255));
  const hex = `#${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  const components = bytes.map((byte) => Math.round((byte / 255) * 1e5) / 1e5);
  return `{ colorSpace: "srgb", components: [${components.join(", ")}], hex: "${hex}" }`;
};

/**
 * One ramp's token entries: the seed's hue and chroma carried across the
 * ladder in each of the ramp's columns, every stop rendered by `wrap` —
 * bare structured colors for a layer's bindings, full definitions for the
 * base ramps.
 */
const ramp = (name, seed, wrap) => {
  const { chroma, hue } = oklch(seed.toLowerCase());
  const columns = NEUTRAL_RAMPS.has(name) ? COLUMNS.slice(0, 1) : COLUMNS;
  return columns.flatMap((column) => {
    return Object.entries(STOPS).map(([stop, curve]) => {
      const channels = fit({
        lightness: curve.lightness,
        chroma: chroma * curve.chroma * column.chroma,
        hue,
      });
      return `    "${name}${column.suffix}-${stop}": ${wrap(color(channels))},`;
    });
  });
};

/**
 * The banner every generated file opens with, under the file's own title
 * line.
 */
const banner = [
  " * Generated by scripts/generate.mjs from scripts/seeds.json; regenerate",
  " * with `pnpm generate`, do not edit by hand.",
];

const seeds = JSON.parse(
  await readFile(new URL("seeds.json", import.meta.url), "utf8"),
);

/* The base ramps: full definitions, spread into the preset's token map. */
const definitions = Object.entries(seeds.base).flatMap(([name, seed]) => {
  return ramp(name, seed, (value) => `{ $type: "color", $value: ${value} }`);
});
await writeFile(
  new URL("src/ramps.ts", ROOT),
  [
    "/**",
    " * The base tonal ramps: every functional palette at the eleven stops,",
    " * seeded from scripts/seeds.json.",
    ...banner,
    " */",
    'import type { Authored } from "@untheme/schema";',
    "",
    "export const ramps = {",
    ...definitions.map((line) => line.slice(2)),
    "} satisfies Record<string, Authored>;",
    "",
  ].join("\n"),
);

/* The theme layers: identity plus re-seeded ramps, one file per theme. */
for (const [id, theme] of Object.entries(seeds.themes)) {
  const bindings = Object.entries(theme.seeds).flatMap(([name, seed]) => {
    return ramp(name, seed, (value) => value);
  });
  await writeFile(
    new URL(`src/themes/${id}.ts`, ROOT),
    [
      "/**",
      ` * ${theme.name} — ${theme.description}.`,
      ...banner,
      " *",
      " * A theme rebinds only the tonal ramps: every role and every modifier",
      " * context lives in the base contract and reads the new values through",
      " * its ramp references.",
      " */",
      'import type { AuroraLayer } from "../types";',
      "",
      "export default {",
      `  id: "${id}",`,
      `  name: "${theme.name}",`,
      "  tokens: {",
      ...bindings,
      "  },",
      "} satisfies AuroraLayer;",
      "",
    ].join("\n"),
  );
}

console.log(
  `generated src/ramps.ts (${Object.keys(seeds.base).length} ramps) and ${Object.keys(seeds.themes).length} theme layers`,
);
