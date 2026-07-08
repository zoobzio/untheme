import { describe, it, expect } from "vitest";

import { clone } from "../src/clone";
import { diff } from "../src/diff";
import { merge } from "../src/merge";
import { theme } from "./fixture";

describe("diff", () => {
  it("reports nothing for a structurally identical clone", () => {
    const result = diff(theme, clone(theme));
    expect(result.tokens).toEqual({});
    expect(result.modifiers).toEqual({
      mode: { light: {}, dark: {} },
      contrast: { normal: {}, high: {} },
    });
  });

  it("ignores equal-but-not-identical values", () => {
    /* Rebind color.bg to a fresh object equal to the original value. */
    const edited = merge(theme, {
      tokens: { "color.bg": { colorSpace: "srgb", components: [1, 1, 1] } },
    });
    expect(edited.tokens["color.bg"].$value).not.toBe(
      theme.tokens["color.bg"].$value,
    );
    expect(diff(theme, edited).tokens).toEqual({});
  });

  it("reports a changed structured value as a bare binding", () => {
    const edited = merge(theme, {
      tokens: { "color.bg": { colorSpace: "hsl", components: [0, 0, 0] } },
    });
    const result = diff(theme, edited);

    expect(result.tokens).toEqual({
      "color.bg": { colorSpace: "hsl", components: [0, 0, 0] },
    });
    /* The emitted value is the binding, not the whole slot. */
    expect(result.tokens["color.bg"]).not.toHaveProperty("$type");
  });

  it("emits copies, not references into `to`", () => {
    const edited = merge(theme, {
      tokens: { "color.bg": { colorSpace: "hsl", components: [0, 0, 0] } },
    });
    const result = diff(theme, edited);
    expect(result.tokens["color.bg"]).not.toBe(
      edited.tokens["color.bg"].$value,
    );
  });

  it("holds only deviating bindings, token and context wise", () => {
    const edited = merge(theme, {
      tokens: { "color.accent": "{color.bg}" },
      modifiers: { mode: { dark: { "color.fg": "{color.accent}" } } },
    });
    const result = diff(theme, edited);

    expect(result.tokens).toEqual({ "color.accent": "{color.bg}" });
    expect(result.modifiers).toEqual({
      mode: { light: {}, dark: { "color.fg": "{color.accent}" } },
      contrast: { normal: {}, high: {} },
    });
  });

  it("does not compare identity", () => {
    const renamed = merge(theme, { id: "other", name: "Other" });
    expect(diff(theme, renamed).tokens).toEqual({});
  });

  it("round-trips through merge", () => {
    const edited = merge(theme, {
      tokens: { "color.bg": "{color.accent}" },
      modifiers: { mode: { dark: { "color.fg": "{color.accent}" } } },
    });
    const result = diff(theme, edited);
    const restored = merge(theme, {
      tokens: result.tokens,
      modifiers: result.modifiers,
    });

    expect(restored.tokens).toEqual(edited.tokens);
    expect(restored.modifiers).toEqual(edited.modifiers);
  });
});
