import { describe, expect, it } from "vitest";

import { defineUntheme } from "@untheme/core";

import { preset } from "../src/preset";
import dracula from "../src/themes/dracula";

import type { FoundationInput } from "../src/types";

const boot = (input: Partial<FoundationInput> = {}) => {
  return defineUntheme(
    preset.use({
      color: "light",
      contrast: "default",
      text: "md",
      density: "default",
      radius: "default",
      motion: "default",
      ...input,
    }),
    { dracula },
  );
};

describe("the color axis", () => {
  it("rebinds the surface roles between modes", () => {
    const ut = boot();
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-10"));
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-90"));
  });
});

describe("the contrast axis", () => {
  it("pushes light mode toward black", () => {
    const ut = boot({ contrast: "high" });
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-0"));
  });

  it("pushes dark mode toward white through the same override", () => {
    const ut = boot({ color: "dark", contrast: "high" });
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-100"));
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
    expect(ut.resolve("space-medium")).toEqual({ value: 12, unit: "px" });
    expect(ut.resolve("control-height-medium")).toEqual({
      value: 36,
      unit: "px",
    });
  });

  it("squares every radius under sharp corners", () => {
    const ut = boot({ radius: "sharp" });
    expect(ut.resolve("shape-full")).toEqual({ value: 0, unit: "px" });
    expect(ut.resolve("shape-medium")).toEqual({ value: 0, unit: "px" });
  });

  it("scales the type ramp with the text size", () => {
    const ut = boot({ text: "lg" });
    expect(ut.resolve("body-medium-size")).toEqual({ value: 16, unit: "px" });
  });

  it("zeroes every duration under reduced motion", () => {
    const ut = boot({ motion: "reduced" });
    expect(ut.resolve("duration-long-4")).toEqual({ value: 0, unit: "ms" });
    expect(ut.resolve("easing-standard")).toEqual([0.2, 0, 0, 1]);
  });
});

describe("theme layers", () => {
  it("re-tints the roles through the ramps alone", () => {
    const ut = boot();
    const before = ut.resolve("primary");
    ut.select("dracula");
    expect(ut.resolve("primary")).not.toEqual(before);
    expect(ut.get("primary")).toBe("{primary-40}");
  });

  it("keeps every axis working on the selected theme", () => {
    const ut = boot();
    ut.select("dracula");
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-90"));
    ut.swap("contrast", "high");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-100"));
  });
});
