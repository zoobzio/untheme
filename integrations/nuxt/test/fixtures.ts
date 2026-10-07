import type { Contract } from "#build/untheme/config.mjs";
import type { Layer } from "untheme";

/**
 * Shared test fixtures. These are the base theme and the initial selection
 * of the build stub. The token shape matches the `#build/untheme` unions of
 * the stub.
 */
export { theme, input } from "../src/stubs/build/untheme/config.mjs";

/**
 * A catalog of layers for the contract of the stub, keyed by id.
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
