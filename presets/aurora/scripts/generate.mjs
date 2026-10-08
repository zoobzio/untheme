/**
 * Generates the themes from `scripts/seeds.json` as DTCG JSON. The script
 * writes one token document for each theme at `src/themes/<id>.json`. The
 * document holds the name, the description, and the eight ramps of the theme.
 * Each document is a layer of the kit config. The `aurora` document is also
 * the `ramps` set of the resolver. The script does not change the resolver.
 *
 * Each seed gives a hue and a chroma. All ramps use one OKLCH lightness ladder
 * across the eleven Tailwind-style stops, 50 to 950. The chroma curve peaks at
 * the middle stops and tapers toward both ends. The accent ramps also have a
 * muted column and a vivid column for the vibrancy modifier. When a color is
 * outside the sRGB gamut, the script reduces its chroma until sRGB holds it.
 *
 * Run `pnpm generate && pnpm format`.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

/** The ramps that have only the balanced column. */
const NEUTRAL_RAMPS = new Set(["neutral", "neutral-variant"]);

/**
 * The chroma columns. Each column has a name suffix and a multiplier for the
 * chroma of the seed. The accent ramps have all three columns.
 */
const COLUMNS = [
  { suffix: "", chroma: 1 },
  { suffix: "-muted", chroma: 0.45 },
  { suffix: "-vivid", chroma: 1.4 },
];

/**
 * The shared lightness ladder and chroma curve. Each stop has the OKLCH
 * lightness of the stop and a multiplier for the chroma of the seed.
 */
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

/** Returns the OKLCH lightness, chroma, and hue of a hex color. */
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
 * Converts OKLCH coordinates to sRGB channels in the range 0 to 1. Returns
 * `null` when the color is outside the sRGB gamut.
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
 * Returns sRGB channels for the coordinates. When the color is outside the
 * gamut, the function reduces the chroma and keeps the lightness and the hue.
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
 * Makes a DTCG color value from sRGB channels. The value has components with
 * five decimals and a lowercase hex string.
 */
const color = (channels) => {
  const bytes = channels.map((channel) => Math.round(channel * 255));
  const hex = `#${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  const components = bytes.map((byte) => Math.round((byte / 255) * 1e5) / 1e5);
  return { colorSpace: "srgb", components, hex };
};

/**
 * Makes the tokens of one ramp. The function applies the hue and the chroma of
 * the seed to the ladder in each column. It makes one color token for each
 * stop.
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
 * Writes one document for each theme. The document holds all eight ramps. The
 * script removes the theme folder first, so each run writes the full set.
 */
await rm(new URL("src/themes/", ROOT), { recursive: true, force: true });
for (const [id, theme] of Object.entries(themes)) {
  const document = {
    $description: theme.description,
    $extensions: { "io.zoobz.untheme": { name: theme.name } },
  };
  for (const [name, seed] of Object.entries(theme.seeds)) {
    Object.assign(document, ramp(name, seed));
  }
  await write(`src/themes/${id}.json`, document);
}

console.log(`generated ${Object.keys(themes).length} themes`);
