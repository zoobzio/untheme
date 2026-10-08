import type { Layer } from "untheme";
import type { theme } from "./fixtures";

/**
 * The layers that stand in for the themes of aurora. Each one rebinds the
 * surface roles. `fixture` is the base itself, with no bindings. The module
 * imports nothing at run time, so the mocks can load it without a cycle.
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
 * A stand-in for the `@untheme/aurora/layers` manifest. `vitest.config.ts`
 * aliases the module here, so the picker starts from the fixture layers and
 * no test waits for a build of aurora.
 */
export const layers = fixtureLayers.map(({ id, name }) => ({ id, name }));
