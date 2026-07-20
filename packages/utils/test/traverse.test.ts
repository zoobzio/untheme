import { describe, expect, it } from "vitest";

import { keys } from "@untheme/common";

import { traverse } from "../src/traverse";
import { theme } from "./fixture";

describe("traverse", () => {
  it("rebuilds every context of every modifier through the callback", () => {
    const counts = traverse(theme.modifiers, (overrides) => {
      return keys(overrides).length;
    });
    expect(counts).toEqual({
      mode: { light: 0, dark: 2 },
      contrast: { normal: 0, high: 1 },
    });
  });

  it("keeps each modifier's own context keys", () => {
    const shape = traverse(theme.modifiers, () => true);
    if (shape.mode === undefined || shape.contrast === undefined) {
      throw new Error("expected mode and contrast modifiers");
    }
    expect(keys(shape.mode).sort()).toEqual(["dark", "light"]);
    expect(keys(shape.contrast).sort()).toEqual(["high", "normal"]);
  });

  it("hands the leaf its own coordinates in another structure via at", () => {
    const mirrored = traverse(theme.modifiers, (_, at) => {
      return at(theme.modifiers);
    });
    expect(mirrored.mode?.dark).toBe(theme.modifiers.mode.dark);
    expect(mirrored.contrast?.high).toBe(theme.modifiers.contrast.high);
    expect(mirrored.mode?.light).toBe(theme.modifiers.mode.light);
  });

  it("yields undefined from at where a sparse structure holds nothing", () => {
    const found = traverse(theme.modifiers, (_, at) => {
      return at({ mode: { dark: { "color.bg": "{color.fg}" } } });
    });
    if (found.mode === undefined || found.contrast === undefined) {
      throw new Error("expected mode and contrast modifiers");
    }
    expect(found.mode.dark).toEqual({ "color.bg": "{color.fg}" });
    expect(found.mode.light).toBeUndefined();
    expect(found.contrast.high).toBeUndefined();
  });

  it("combines a leaf with its counterpart", () => {
    const merged = traverse(theme.modifiers, (overrides, at) => {
      return { ...at(theme.modifiers), ...overrides };
    });
    expect(merged.mode?.dark).toEqual(theme.modifiers.mode.dark);
    expect(merged.contrast?.normal).toEqual({});
  });
});
