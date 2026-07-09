import { describe, expect, it } from "vitest";

import { preset } from "../src/preset";

const config = preset.use({
  color: "light",
  contrast: "default",
  text: "md",
  density: "default",
  radius: "default",
  motion: "default",
});

const { modifiers, order, tokens } = config.theme;

/**
 * Every token an axis touches, across all of its contexts.
 */
const touched = (axis: keyof typeof modifiers) => {
  const keys = new Set<string>();
  for (const context of Object.values(modifiers[axis])) {
    for (const key of Object.keys(context)) {
      keys.add(key);
    }
  }
  return keys;
};

describe("axis composition", () => {
  it("declares every axis in order exactly once", () => {
    expect([...order].sort()).toEqual(Object.keys(modifiers).sort());
    expect(new Set(order).size).toBe(order.length);
  });

  it("resolves contrast after color", () => {
    expect(order.indexOf("contrast")).toBeGreaterThan(order.indexOf("color"));
  });

  it("leaves the default context of every axis empty", () => {
    expect(modifiers.color.light).toEqual({});
    expect(modifiers.contrast.default).toEqual({});
    expect(modifiers.text.md).toEqual({});
    expect(modifiers.density.default).toEqual({});
    expect(modifiers.radius.default).toEqual({});
    expect(modifiers.motion.default).toEqual({});
  });

  it("keeps the axes orthogonal outside the color/contrast collision", () => {
    for (const a of order) {
      for (const b of order) {
        if (a >= b) {
          continue;
        }
        if ([a, b].sort().join("+") === "color+contrast") {
          continue;
        }
        const overlap = [...touched(a)].filter((key) => touched(b).has(key));
        expect(overlap).toEqual([]);
      }
    }
  });
});

describe("contrast channels", () => {
  it("re-points every shifted role at its own channel token", () => {
    for (const level of ["medium", "high"] as const) {
      for (const [role, binding] of Object.entries(modifiers.contrast[level])) {
        expect(binding).toBe(`{${role}-${level}-contrast}`);
      }
    }
  });

  it("defines every channel a contrast override targets", () => {
    for (const level of ["medium", "high"] as const) {
      for (const role of Object.keys(modifiers.contrast[level])) {
        expect(tokens).toHaveProperty([`${role}-${level}-contrast`]);
      }
    }
  });

  it("rebinds every channel in the dark context", () => {
    for (const level of ["medium", "high"] as const) {
      for (const role of Object.keys(modifiers.contrast[level])) {
        expect(modifiers.color.dark).toHaveProperty([
          `${role}-${level}-contrast`,
        ]);
      }
    }
  });

  it("shifts the same role set at both contrast levels", () => {
    expect(Object.keys(modifiers.contrast.medium).sort()).toEqual(
      Object.keys(modifiers.contrast.high).sort(),
    );
  });
});
