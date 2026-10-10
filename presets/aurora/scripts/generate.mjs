/**
 * Generates the themes from `scripts/seeds.json` as DTCG JSON. The script
 * writes one token document for each theme at `src/themes/<id>.json`. The
 * document holds the name, the description, and the eight ramps of the theme.
 * The `aurora` document is also the `ramps` set of the resolver. The ramps
 * come from `ramp.mjs`, which the package exports as `@untheme/aurora/ramp`.
 *
 * Run `pnpm generate && pnpm format`.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

import { palette } from "./ramp.mjs";

const ROOT = new URL("../", import.meta.url);

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
 * Writes one document for each theme. The script removes the theme folder
 * first.
 */
await rm(new URL("src/themes/", ROOT), { recursive: true, force: true });
for (const [id, theme] of Object.entries(themes)) {
  await write(`src/themes/${id}.json`, palette(theme));
}

console.log(`generated ${Object.keys(themes).length} themes`);
