import type { Open, Shadow } from "@untheme/schema";

import { describe, expect, it } from "vitest";

import { entries } from "objectively";

import { FONT_WEIGHT_NUMBERS, RESERVED_FAMILY_NAMES } from "../src/constant";
import { emit, serialize } from "../src/serialize";

describe("serialize", () => {
  describe("color", () => {
    it("prefers the hex fallback when present", () => {
      expect(
        serialize("color", {
          colorSpace: "srgb",
          components: [0.98, 0.97, 0.95],
          hex: "#faf7f2",
        }),
      ).toBe("#faf7f2");
    });

    it("emits hsl and hwb with percentage components and none passthrough", () => {
      expect(
        serialize("color", {
          colorSpace: "hsl",
          components: [120, 50, "none"],
        }),
      ).toBe("hsl(120 50% none)");
      expect(
        serialize("color", { colorSpace: "hwb", components: [120, 50, 20] }),
      ).toBe("hwb(120 50% 20%)");
    });

    it("emits the lab/lch family by name, appending alpha", () => {
      const spaces = ["lab", "lch", "oklab", "oklch"] as const;
      for (const space of spaces) {
        expect(
          serialize("color", {
            colorSpace: space,
            components: [0.5, 0.1, 200],
            alpha: 0.8,
          }),
        ).toBe(`${space}(0.5 0.1 200 / 0.8)`);
      }
    });

    it("emits every other space through color()", () => {
      expect(
        serialize("color", { colorSpace: "srgb", components: [1, 1, 1] }),
      ).toBe("color(srgb 1 1 1)");
      expect(
        serialize("color", { colorSpace: "display-p3", components: [1, 0, 0] }),
      ).toBe("color(display-p3 1 0 0)");
    });

    it("emits a whole-value reference as a var() indirection", () => {
      expect(serialize("color", "{color.ink}")).toBe("var(--color-ink)");
    });
  });

  describe("dimension and duration", () => {
    it("appends the unit to the value", () => {
      expect(serialize("dimension", { value: 4, unit: "px" })).toBe("4px");
      expect(serialize("duration", { value: 150, unit: "ms" })).toBe("150ms");
    });
  });

  describe("fontFamily", () => {
    it("emits a bare name and a comma-joined stack", () => {
      expect(serialize("fontFamily", "monospace")).toBe("monospace");
      expect(serialize("fontFamily", ["Helvetica Neue", "sans-serif"])).toBe(
        '"Helvetica Neue", sans-serif',
      );
    });

    it("quotes every reserved family name", () => {
      for (const name of RESERVED_FAMILY_NAMES) {
        expect(serialize("fontFamily", name)).toBe(`"${name}"`);
      }
    });

    it("escapes quotes and backslashes in a quoted name", () => {
      expect(serialize("fontFamily", 'My "Font"')).toBe('"My \\"Font\\""');
    });
  });

  describe("fontWeight", () => {
    it("maps every keyword to its numeric equivalent", () => {
      for (const [keyword, number] of entries(FONT_WEIGHT_NUMBERS)) {
        expect(serialize("fontWeight", keyword)).toBe(String(number));
      }
    });

    it("passes a numeric weight through", () => {
      expect(serialize("fontWeight", 400)).toBe("400");
    });
  });

  describe("number and cubicBezier", () => {
    it("stringifies a number and joins a bezier", () => {
      expect(serialize("number", 0.5)).toBe("0.5");
      expect(serialize("cubicBezier", [0.4, 0, 0.2, 1])).toBe(
        "cubic-bezier(0.4, 0, 0.2, 1)",
      );
    });
  });

  describe("strokeStyle", () => {
    it("passes a keyword through and nears a dash object to dashed", () => {
      expect(serialize("strokeStyle", "solid")).toBe("solid");
      expect(
        serialize("strokeStyle", {
          dashArray: [{ value: 2, unit: "px" }],
          lineCap: "round",
        }),
      ).toBe("dashed");
    });
  });

  describe("composites", () => {
    it("emits a border as the shorthand", () => {
      expect(
        serialize("border", {
          width: { value: 1, unit: "px" },
          style: "solid",
          color: { colorSpace: "srgb", components: [0, 0, 0] },
        }),
      ).toBe("1px solid color(srgb 0 0 0)");
    });

    it("emits a transition as the shorthand", () => {
      expect(
        serialize("transition", {
          duration: { value: 150, unit: "ms" },
          delay: { value: 0, unit: "ms" },
          timingFunction: [0.4, 0, 0.2, 1],
        }),
      ).toBe("150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms");
    });

    it("emits a single shadow and a comma-joined stack with a referenced layer", () => {
      const layer: Shadow<Open> = {
        color: { colorSpace: "srgb", components: [0, 0, 0] },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 1, unit: "px" },
        blur: { value: 2, unit: "px" },
        spread: { value: 0, unit: "px" },
      };
      expect(serialize("shadow", layer)).toBe(
        "0px 1px 2px 0px color(srgb 0 0 0)",
      );
      expect(serialize("shadow", ["{depth.low}", layer])).toBe(
        "var(--depth-low), 0px 1px 2px 0px color(srgb 0 0 0)",
      );
    });

    it("scales a literal gradient position and a referenced one through calc()", () => {
      expect(
        serialize("gradient", [
          { color: { colorSpace: "srgb", components: [1, 1, 1] }, position: 1 },
          { color: "{color.ink}", position: "{scale.half}" },
        ]),
      ).toBe(
        "linear-gradient(color(srgb 1 1 1) 100%, var(--color-ink) calc(var(--scale-half) * 100%))",
      );
    });

    it("emits a typography set as the font shorthand", () => {
      expect(
        serialize("typography", {
          fontFamily: "{font.stack}",
          fontSize: { value: 1, unit: "rem" },
          fontWeight: 400,
          letterSpacing: { value: 0, unit: "px" },
          lineHeight: 1.5,
        }),
      ).toBe("400 1rem/1.5 var(--font-stack)");
    });
  });
});

describe("emit", () => {
  it("keys the value's own serialization under the empty suffix", () => {
    expect(
      emit("color", { colorSpace: "srgb", components: [1, 1, 1] }),
    ).toEqual({
      "": "color(srgb 1 1 1)",
    });
  });

  it("adds typography's letter-spacing sibling under its suffix", () => {
    expect(
      emit("typography", {
        fontFamily: "{font.stack}",
        fontSize: { value: 1, unit: "rem" },
        fontWeight: 400,
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: 1.5,
      }),
    ).toEqual({
      "": "400 1rem/1.5 var(--font-stack)",
      "-letter-spacing": "0px",
    });
  });

  it("points a typography reference's sibling at the target's own sibling", () => {
    expect(emit("typography", "{type.body}")).toEqual({
      "": "var(--type-body)",
      "-letter-spacing": "var(--type-body-letter-spacing)",
    });
  });
});
