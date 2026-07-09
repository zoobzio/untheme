import type { Contract } from "@untheme/schema";

import { describe, expect, it } from "vitest";

import { map } from "@untheme/common";
import { defineSchema } from "@untheme/schema";

import { defineRenderer, property } from "../src/index";
import { theme } from "./fixture";

/**
 * A renderer over the fixture's base bindings through plain accessors — no
 * core service involved, proving the source contract stands on its own.
 */
const make = () => {
  return defineRenderer({
    config: { theme },
    tokens: () => map(theme.tokens, (slot) => slot.$value),
  });
};

describe("fixture", () => {
  it("satisfies the schema contract, as trusted input must", () => {
    expect(() => defineSchema(theme)).not.toThrow();
  });
});

describe("property", () => {
  it("dashes dotted token names", () => {
    expect(property("color.bg")).toBe("--color-bg");
    expect(property("color.fg.muted")).toBe("--color-fg-muted");
  });
});

describe("defineRenderer", () => {
  describe("variables", () => {
    const variables = make().variables();

    it("keys every token by its custom property name", () => {
      expect(variables["--color-white"]).toBe("color(srgb 1 1 1)");
      expect(variables["--space-sm"]).toBe("4px");
    });

    it("emits whole-value references as var() indirections", () => {
      expect(variables["--color-accent"]).toBe("var(--color-ink)");
    });

    it("emits a typography token with its letter-spacing sibling", () => {
      expect(variables["--type-body"]).toBe("400 1rem/1.5 var(--font-stack)");
      expect(variables["--type-body-letter-spacing"]).toBe("0px");
    });

    it("keeps a typography reference pair-wise", () => {
      expect(variables["--type-display"]).toBe("var(--type-body)");
      expect(variables["--type-display-letter-spacing"]).toBe(
        "var(--type-body-letter-spacing)",
      );
    });
  });

  describe("serialization", () => {
    const variables = make().variables();

    it("prefers the hex fallback", () => {
      expect(variables["--color-paper"]).toBe("#faf7f2");
    });

    it("emits the named function for the lab/lch family, with alpha", () => {
      expect(variables["--color-ink"]).toBe("oklch(0.32 0.02 260 / 0.9)");
    });

    it("emits hsl with percentage components and none passthrough", () => {
      expect(variables["--color-mist"]).toBe("hsl(120 50% none)");
    });

    it("emits dimensions and durations with their units", () => {
      expect(variables["--space-sm"]).toBe("4px");
      expect(variables["--time-fast"]).toBe("150ms");
    });

    it("emits font families, quoting names that need it", () => {
      expect(variables["--font-stack"]).toBe('"Helvetica Neue", sans-serif');
      expect(variables["--font-mono"]).toBe("monospace");
    });

    it("maps font weight keywords to numbers", () => {
      expect(variables["--weight-bold"]).toBe("600");
    });

    it("emits numbers and cubic beziers", () => {
      expect(variables["--scale-half"]).toBe("0.5");
      expect(variables["--ease-smooth"]).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    });

    it("passes stroke keywords through and nears dash objects to dashed", () => {
      expect(variables["--stroke-solid"]).toBe("solid");
      expect(variables["--stroke-dashed"]).toBe("dashed");
    });

    it("emits nested references in place inside composites", () => {
      expect(variables["--edge-card"]).toBe(
        "var(--space-sm) solid var(--color-accent)",
      );
      expect(variables["--move-fade"]).toBe(
        "var(--time-fast) var(--ease-smooth) 0ms",
      );
    });

    it("emits shadow stacks with referenced layers", () => {
      expect(variables["--depth-low"]).toBe(
        "0px 1px 2px 0px oklch(0.32 0.02 260 / 0.9)",
      );
      expect(variables["--depth-stack"]).toBe(
        "var(--depth-low), 0px 4px 8px -2px var(--color-ink)",
      );
    });

    it("scales referenced gradient positions through calc()", () => {
      expect(variables["--fade-hero"]).toBe(
        "linear-gradient(var(--color-ink) 0%, color(srgb 1 1 1) calc(var(--scale-half) * 100%), color(srgb 1 1 1) 100%)",
      );
    });
  });

  describe("accessors", () => {
    const renderer = make();

    it("names a token's custom property", () => {
      expect(renderer.property("color.white")).toBe("--color-white");
    });

    it("wraps a token's custom property in var()", () => {
      expect(renderer.var("color.white")).toBe("var(--color-white)");
    });

    it("serializes a single token's binding", () => {
      expect(renderer.value("space.sm")).toBe("4px");
      expect(renderer.value("color.accent")).toBe("var(--color-ink)");
    });

    it("rejects tokens outside the contract", () => {
      // @ts-expect-error not a token of the fixture
      void (() => renderer.property("color.ghost"));
      // @ts-expect-error not a token of the fixture
      void (() => renderer.var("color.ghost"));
    });
  });

  describe("root", () => {
    it("generates a single :root block over the active declarations", () => {
      const css = make().root();
      expect(css.match(/:root \{/g)).toHaveLength(1);
      expect(css).toContain(" --color-white: color(srgb 1 1 1);");
      expect(css).toContain(" --color-accent: var(--color-ink);");
      expect(css.endsWith("}")).toBe(true);
    });
  });

  describe("sheet", () => {
    const css = make().sheet();

    it("emits the base bindings under :root", () => {
      expect(css).toContain(":root {");
      expect(css).toContain(" --color-paper: #faf7f2;");
    });

    it("emits a context's overrides under its data-attribute block", () => {
      expect(css).toContain('[data-mode="dark"] {');
      expect(css).toContain(" --color-accent: var(--color-white);");
    });

    it("skips contexts without overrides", () => {
      expect(css).not.toContain('[data-mode="light"]');
    });

    it("holds only the overridden tokens in a context block", () => {
      const dark = css.slice(css.indexOf('[data-mode="dark"]'));
      expect(dark).not.toContain("--space-sm");
    });
  });

  describe("escaping", () => {
    /* Names the schema admits but CSS text must not take at face value: a
       family carrying a quote, a family named by a reserved word, and a
       modifier axis and context carrying quotes. */
    type OddTok = "font.brand" | "font.reserved";
    type OddMod = { 'mo"de': { plain: object; 'dar"k': object } };
    const odd: Contract<OddTok, OddMod> = {
      id: "odd",
      name: "Odd",
      tokens: {
        "font.brand": { $type: "fontFamily", $value: ['My "Font"', "serif"] },
        "font.reserved": { $type: "fontFamily", $value: "inherit" },
      },
      modifiers: {
        'mo"de': { plain: {}, 'dar"k': { "font.reserved": "monospace" } },
      },
      order: ['mo"de'],
    };
    const renderer = defineRenderer({
      config: { theme: odd },
      tokens: () => map(odd.tokens, (slot) => slot.$value),
    });

    it("escapes quotes inside a quoted family name", () => {
      expect(renderer.variables()["--font-brand"]).toBe(
        '"My \\"Font\\"", serif',
      );
    });

    it("quotes a family named by a reserved word", () => {
      expect(renderer.variables()["--font-reserved"]).toBe('"inherit"');
    });

    it("escapes the modifier and context in the sheet's attribute selector", () => {
      expect(renderer.sheet()).toContain('[data-mo\\"de="dar\\"k"] {');
    });
  });

  describe("lazy source", () => {
    it("reads the accessors on every call, so a rebind re-renders", () => {
      const bindings = map(theme.tokens, (slot) => slot.$value);
      const renderer = defineRenderer({
        config: { theme },
        tokens: () => bindings,
      });

      expect(renderer.variables()["--color-accent"]).toBe("var(--color-ink)");

      bindings["color.accent"] = "{color.white}";
      expect(renderer.variables()["--color-accent"]).toBe("var(--color-white)");
      expect(renderer.value("color.accent")).toBe("var(--color-white)");
    });
  });
});
