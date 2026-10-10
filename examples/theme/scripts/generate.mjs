/**
 * Generates the palette of the theme as DTCG JSON. The script writes one token
 * document, `src/mantis.json`, with the name, the description, and the eight
 * ramps of the theme. The ramps come from the generator of aurora, so they
 * share its lightness ladder and its chroma curve. The palette rebinds the
 * `ramps` set of aurora, and every role of aurora resolves from it.
 *
 * Run `pnpm generate && pnpm format`.
 */
import { writeFile } from "node:fs/promises";

import { palette } from "@untheme/aurora/ramp";

/**
 * The theme: the peacock mantis shrimp. Teal carapace, coral legs, violet eye
 * stripes, on greys with a green cast. The `error`, `success`, and `warning`
 * seeds are those of aurora.
 */
const MANTIS = {
  name: "Mantis",
  description:
    "Peacock teal, coral, and violet on greys with a green cast: the palette of the mantis shrimp",
  seeds: {
    primary: "#00a3a8",
    secondary: "#ff5a36",
    tertiary: "#7b4fd6",
    error: "#dc4a5e",
    success: "#57a53c",
    warning: "#c08a1f",
    neutral: "#6f766a",
    "neutral-variant": "#74786b",
  },
};

await writeFile(
  new URL("../src/mantis.json", import.meta.url),
  `${JSON.stringify(palette(MANTIS), null, 2)}\n`,
);

console.log("generated src/mantis.json");
