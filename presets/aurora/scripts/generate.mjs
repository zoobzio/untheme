/**
 * Regenerates the themes from scripts/seeds.json as DTCG JSON: each theme as
 * one token document, src/modifiers/theme/<id>.json, holding its name, its
 * description and its eight ramps,
 * and the contexts of the `theme` modifier in src/resolver.json — one per
 * theme, in seed order. Each seed contributes its hue and chroma;
 * every ramp shares one OKLCH lightness ladder across the eleven
 * Tailwind-style stops (50–950), with a chroma curve that peaks at the middle
 * and tapers toward both ends. The accent ramps additionally emit muted and
 * vivid chroma columns for the vibrancy axis; the neutral ramps are exempt.
 * Out of gamut colors reduce chroma until sRGB can hold them. Run with
 * `pnpm generate && pnpm format`.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

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
 * components with the lowercase hex fallback.
 */
const color = (channels) => {
  const bytes = channels.map((channel) => Math.round(channel * 255));
  const hex = `#${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  const components = bytes.map((byte) => Math.round((byte / 255) * 1e5) / 1e5);
  return { colorSpace: "srgb", components, hex };
};

/**
 * One ramp as a DTCG token document: the seed's hue and chroma carried
 * across the ladder in each of the ramp's columns, one color token per stop.
 */
const ramp = (name, seed) => {
  const { chroma, hue } = oklch(seed.toLowerCase());
  const columns = NEUTRAL_RAMPS.has(name) ? COLUMNS.slice(0, 1) : COLUMNS;
  const document = {};
  for (const column of columns) {
    for (const [stop, curve] of Object.entries(STOPS)) {
      const channels = fit({
        lightness: curve.lightness,
        chroma: chroma * curve.chroma * column.chroma,
        hue,
      });
      document[`${name}${column.suffix}-${stop}`] = {
        $type: "color",
        $value: color(channels),
      };
    }
  }
  return document;
};

/** Writes a JSON document, creating its folder. */
const write = async (path, document) => {
  const url = new URL(path, ROOT);
  await mkdir(new URL("./", url), { recursive: true });
  await writeFile(url, `${JSON.stringify(document, null, 2)}\n`);
};

const themes = JSON.parse(
  await readFile(new URL("seeds.json", import.meta.url), "utf8"),
);

/*
 * The themes: one document per theme, every ramp in it. The theme folder is
 * regenerated whole, so a theme removed from the seeds leaves no file behind.
 */
await rm(new URL("src/modifiers/theme/", ROOT), {
  recursive: true,
  force: true,
});
for (const [id, theme] of Object.entries(themes)) {
  const document = {
    $description: theme.description,
    $extensions: { "io.zoobz.untheme": { name: theme.name } },
  };
  for (const [name, seed] of Object.entries(theme.seeds)) {
    Object.assign(document, ramp(name, seed));
  }
  await write(`src/modifiers/theme/${id}.json`, document);
}

/*
 * The resolver document is authored; only the contexts of its `theme`
 * modifier are generated — one per theme, each the theme's own document.
 */
const resolver = JSON.parse(
  await readFile(new URL("src/resolver.json", ROOT), "utf8"),
);
resolver.modifiers.theme.contexts = Object.fromEntries(
  Object.keys(themes).map((id) => [
    id,
    [{ $ref: `./modifiers/theme/${id}.json` }],
  ]),
);
await write("src/resolver.json", resolver);

console.log(`generated ${Object.keys(themes).length} themes`);
