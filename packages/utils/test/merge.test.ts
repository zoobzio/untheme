import { describe, it, expect } from "vitest";

import { merge } from "../src/merge";
import { theme } from "./fixture";

describe("merge", () => {
  it("returns a detached clone for no overlays", () => {
    const result = merge(theme);
    expect(result).toEqual(theme);
    expect(result).not.toBe(theme);
  });

  it("returns the theme unchanged for an empty overlay", () => {
    expect(merge(theme, {})).toEqual(theme);
  });

  it("rebinds $value while preserving $type and metadata", () => {
    const result = merge(theme, { tokens: { "color.fg": "{color.accent}" } });
    expect(result.tokens["color.fg"].$value).toBe("{color.accent}");
    expect(result.tokens["color.fg"].$type).toBe("color");
    expect(result.tokens["color.fg"].$description).toBe("Foreground");
  });

  it("replaces a structured $value atomically, without interleaving keys", () => {
    const result = merge(theme, {
      tokens: { "color.fg": { colorSpace: "hsl", components: [0, 0, 0] } },
    });
    const value = result.tokens["color.fg"].$value;

    expect(value).toEqual({ colorSpace: "hsl", components: [0, 0, 0] });
    /* The alpha carried by the base srgb value must not survive the rebind. */
    const carriesAlpha =
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "alpha" in value;
    expect(carriesAlpha).toBe(false);
  });

  it("skips overlay keys with no base slot", () => {
    const result = merge(theme, { tokens: { "color.ghost": "{color.fg}" } });
    expect("color.ghost" in result.tokens).toBe(false);
  });

  it("shares no object identity with its overlays", () => {
    const overlay = {
      tokens: {
        "color.bg": { colorSpace: "hsl" as const, components: [0, 0, 0] },
      },
    };
    const result = merge(theme, overlay);

    expect(result.tokens["color.bg"].$value).toEqual(
      overlay.tokens["color.bg"],
    );
    expect(result.tokens["color.bg"].$value).not.toBe(
      overlay.tokens["color.bg"],
    );
  });

  it("adopts a layer's identity", () => {
    const result = merge(theme, {
      id: "night",
      name: "Night",
      tokens: { "color.bg": "{color.fg}" },
    });
    expect(result.id).toBe("night");
    expect(result.name).toBe("Night");
  });

  it("preserves identity for an anonymous patch", () => {
    const result = merge(theme, { tokens: { "color.bg": "{color.fg}" } });
    expect(result.id).toBe("demo");
    expect(result.name).toBe("Demo");
  });

  it("merges a single context without touching the others", () => {
    const result = merge(theme, {
      modifiers: { mode: { light: { "color.bg": "{color.accent}" } } },
    });
    expect(result.modifiers.mode.light["color.bg"]).toBe("{color.accent}");
    expect(result.modifiers.mode.dark).toEqual(theme.modifiers.mode.dark);
    expect(result.modifiers.contrast).toEqual(theme.modifiers.contrast);
  });

  it("applies overlays left to right: the last binding wins", () => {
    const result = merge(
      theme,
      { tokens: { "color.bg": "{color.fg}" } },
      { tokens: { "color.bg": "{color.accent}" } },
    );
    expect(result.tokens["color.bg"].$value).toBe("{color.accent}");
  });

  it("takes identity from the last overlay that carries one", () => {
    const result = merge(
      theme,
      { id: "first", name: "First" },
      { tokens: { "color.bg": "{color.fg}" } },
      { id: "last", name: "Last" },
    );
    expect(result.id).toBe("last");
    expect(result.name).toBe("Last");
  });

  it("mutates neither input", () => {
    const overlay = { tokens: { "color.bg": "{color.fg}" as const } };
    merge(theme, overlay);
    expect(theme.tokens["color.bg"].$value).toEqual({
      colorSpace: "srgb",
      components: [1, 1, 1],
    });
    expect(overlay.tokens["color.bg"]).toBe("{color.fg}");
  });

  it("returns detached records", () => {
    const result = merge(theme, {});
    result.tokens["color.bg"] = { $type: "color", $value: "{color.fg}" };
    result.modifiers.mode.dark = {};
    expect(theme.tokens["color.bg"].$value).toEqual({
      colorSpace: "srgb",
      components: [1, 1, 1],
    });
    expect(theme.modifiers.mode.dark).toEqual({
      "color.bg": { colorSpace: "srgb", components: [0, 0, 0] },
      "color.fg": "{color.bg}",
    });
  });
});
