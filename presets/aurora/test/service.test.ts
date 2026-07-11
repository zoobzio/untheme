import { describe, expect, it } from "vitest";

import { defineUntheme } from "@untheme/core";

import { preset } from "../src/preset";
import dracula from "../src/themes/dracula";

import type { AuroraInput } from "../src/types";

const boot = (input: Partial<AuroraInput> = {}) => {
  return defineUntheme(
    preset.use({
      color: "light",
      vibrancy: "balanced",
      contrast: "default",
      text: "md",
      density: "default",
      radius: "default",
      depth: "default",
      motion: "default",
      ...input,
    }),
    { dracula },
  );
};

describe("the color axis", () => {
  it("rebinds the surface roles between modes", () => {
    const ut = boot();
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-800"));
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-200"));
  });
});

describe("the vibrancy axis", () => {
  it("re-points accent roles at their chroma column", () => {
    const ut = boot({ vibrancy: "muted" });
    expect(ut.get("primary")).toBe("{primary-muted}");
    expect(ut.get("primary-muted")).toBe("{primary-muted-600}");
    expect(ut.resolve("primary")).toEqual(ut.resolve("primary-muted-600"));
  });

  it("steps through the mode's channel in dark", () => {
    const ut = boot({ color: "dark", vibrancy: "vivid" });
    expect(ut.get("primary-vivid")).toBe("{primary-vivid-400}");
    expect(ut.resolve("primary")).toEqual(ut.resolve("primary-vivid-400"));
  });

  it("loses its collisions to contrast, so accessibility wins", () => {
    const ut = boot({ vibrancy: "vivid", contrast: "high" });
    expect(ut.get("primary")).toBe("{primary-high-contrast}");
  });
});

describe("the contrast axis", () => {
  it("pushes light mode toward the dark end of the ramp", () => {
    const ut = boot({ contrast: "high" });
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-950"));
  });

  it("pushes dark mode toward the light end through the same override", () => {
    const ut = boot({ color: "dark", contrast: "high" });
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-50"));
  });

  it("steps through the mode's channel token", () => {
    const ut = boot({ color: "dark", contrast: "medium" });
    expect(ut.get("on-surface")).toBe("{on-surface-medium-contrast}");
    expect(ut.get("on-surface-medium-contrast")).toBe("{neutral-100}");
  });
});

describe("the dimension axes", () => {
  it("tightens spacing under compact density", () => {
    const ut = boot({ density: "compact" });
    expect(ut.resolve("space-4")).toEqual({ value: 0.75, unit: "rem" });
  });

  it("squares every radius under sharp corners", () => {
    const ut = boot({ radius: "sharp" });
    expect(ut.resolve("shape-full")).toEqual({ value: 0, unit: "px" });
    expect(ut.resolve("shape-md")).toEqual({ value: 0, unit: "px" });
  });

  it("scales the type styles with the text size through sub-value references", () => {
    const ut = boot({ text: "lg" });
    expect(ut.resolve("body-size")).toEqual({ value: 1.125, unit: "rem" });
    expect(ut.resolve("type-body")).toMatchObject({
      fontSize: { value: 1.125, unit: "rem" },
      fontWeight: 400,
      lineHeight: 1.5,
    });
  });

  it("zeroes every duration under reduced motion, and transitions follow", () => {
    const ut = boot({ motion: "reduced" });
    expect(ut.resolve("duration-slow")).toEqual({ value: 0, unit: "ms" });
    expect(ut.resolve("delay-step")).toEqual({ value: 0, unit: "ms" });
    expect(ut.resolve("easing-standard")).toEqual([0.2, 0, 0, 1]);
    expect(ut.resolve("transition-base")).toMatchObject({
      duration: { value: 0, unit: "ms" },
    });
  });

  it("stretches and overshoots under expressive motion", () => {
    const ut = boot({ motion: "expressive" });
    expect(ut.resolve("duration-base")).toEqual({ value: 450, unit: "ms" });
    expect(ut.resolve("easing-standard")).toEqual([0.34, 1.56, 0.64, 1]);
  });

  it("collapses shadows under flat depth and amplifies them under deep", () => {
    const flat = boot({ depth: "flat" });
    expect(flat.resolve("elevation-mid")).toEqual(
      flat.resolve("elevation-none"),
    );
    const deep = boot({ depth: "deep" });
    expect(deep.resolve("elevation-mid")).not.toEqual(
      boot().resolve("elevation-mid"),
    );
  });
});

describe("theme layers", () => {
  it("re-tints the roles through the ramps alone", () => {
    const ut = boot();
    const before = ut.resolve("primary");
    ut.select("dracula");
    expect(ut.resolve("primary")).not.toEqual(before);
    expect(ut.get("primary")).toBe("{primary-600}");
  });

  it("keeps every axis working on the selected theme", () => {
    const ut = boot();
    ut.select("dracula");
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-200"));
    ut.swap("contrast", "high");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-50"));
  });
});
