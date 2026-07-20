import type { Token, Mod } from "#build/types/untheme.d.ts";
import type { Contract, Layer } from "untheme";

/**
 * Shared test fixtures: the valid base theme and initial selection from the
 * build stub, whose token shape matches the stub's `#build/types` unions.
 */
export { theme, input } from "../src/stubs/build/untheme.mjs";

/**
 * A switchable catalog: layers inside the stub's contract, keyed the way an
 * app authors `untheme.themes`.
 */
export const themes: Record<string, Layer<Contract<Token, Mod>>> = {
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
