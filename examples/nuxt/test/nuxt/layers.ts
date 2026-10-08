import type { Layer } from "untheme";
import type { theme } from "./fixtures";

/**
 * The layers of the tests. Each one rebinds tokens of the fixture theme.
 * `fixture` has no bindings. The module has no runtime imports.
 */
export const fixtureLayers: Layer<typeof theme>[] = [
  { id: "fixture", name: "Fixture" },
  {
    id: "ink",
    name: "Ink",
    tokens: { surface: "{black}", "on-surface": "{white}" },
  },
  { id: "paper", name: "Paper", tokens: { gap: "{gap}" } },
];

/**
 * The layers module of the tests, in place of `#build/untheme/layers.mjs`.
 */
export const layers = fixtureLayers.map(({ id, name }) => ({ id, name }));
