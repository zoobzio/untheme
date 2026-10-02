import type { Contract } from "#build/untheme/config.mjs";
import type { Layer } from "untheme";

/**
 * Shared test fixtures: the valid base theme and initial selection from the
 * build stub, whose token shape matches the stub's `#build/untheme` unions.
 */
export { theme, input } from "../src/stubs/build/untheme/config.mjs";

/**
 * A switchable catalog: layers inside the stub's contract, keyed by id the
 * way a theme provider serves them.
 */
export const themes: Record<string, Layer<Contract>> = {
  bravo: {
    id: "bravo",
    name: "Bravo",
    modifiers: {
      color: { dark: { primary: "{blue}", surface: "{black}" } },
    },
  },
  charlie: {
    id: "charlie",
    name: "Charlie",
    tokens: { surface: "{black}", "on-surface": "{white}" },
  },
};
