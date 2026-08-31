import type { Template } from "untheme";
import type { UnthemeLayerConfig } from "../../src/resolve";

import { describe, it, expect } from "vitest";

import { resolveUnthemeConfig } from "../../src/resolve";
import { theme, themes, input } from "../fixtures";

const base: UnthemeLayerConfig = {
  theme: theme as Template,
  input,
  themes,
};

/**
 * A complete theme distinct from the base fixture's — what an app composes
 * through a preset (`preset.configure`, `define`) and authors whole.
 */
const rebuilt: Template = {
  ...structuredClone(theme as Template),
  id: "alpha-prime",
  name: "Alpha Prime",
};

describe("resolveUnthemeConfig", () => {
  it("returns a single config as authored", () => {
    const resolved = resolveUnthemeConfig([base]);
    expect(resolved.theme).toEqual(theme);
    expect(resolved.input).toEqual(input);
    expect(resolved.themes).toEqual(themes);
  });

  it("replaces the theme whole with the closest layer's", () => {
    const resolved = resolveUnthemeConfig([{ theme: rebuilt }, base]);
    expect(resolved.theme).toEqual(rebuilt);
  });

  it("never merges arrays across layers", () => {
    const resolved = resolveUnthemeConfig([{ theme: rebuilt }, base]);
    expect(resolved.theme?.order).toEqual(["color"]);
    expect(resolved.theme?.tokens.white?.$value).toEqual(
      theme.tokens.white.$value,
    );
  });

  it("falls through to the deepest theme when closer layers author none", () => {
    const resolved = resolveUnthemeConfig([{ input: { color: "dark" } }, base]);
    expect(resolved.theme).toEqual(theme);
  });

  it("resolves the selection per modifier, closest layer winning", () => {
    const resolved = resolveUnthemeConfig([{ input: { color: "dark" } }, base]);
    expect(resolved.input).toEqual({ color: "dark" });
  });

  it("resolves the catalog per key, a shared key replacing whole", () => {
    const resolved = resolveUnthemeConfig([
      { themes: { bravo: { id: "bravo", name: "Bravo Prime" } } },
      base,
    ]);
    expect(resolved.themes).toEqual({
      bravo: { id: "bravo", name: "Bravo Prime" },
      charlie: themes.charlie,
    });
  });

  it("resolves the css flag to the closest authored value", () => {
    const resolved = resolveUnthemeConfig([{}, { css: false }, base]);
    expect(resolved.css).toBe(false);
    const overridden = resolveUnthemeConfig([{ css: true }, { css: false }]);
    expect(overridden.css).toBe(true);
  });

  it("leaves members no layer authored undefined", () => {
    const resolved = resolveUnthemeConfig([
      { input: { color: "dark" } },
      { theme: theme as Template },
    ]);
    expect(resolved.themes).toBeUndefined();
    const bare = resolveUnthemeConfig([{ input: { color: "dark" } }]);
    expect(bare.theme).toBeUndefined();
    expect(bare.css).toBeUndefined();
  });
});
