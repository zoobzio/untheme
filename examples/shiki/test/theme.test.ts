import { describe, expect, it } from "vitest";

import { defineRenderer } from "untheme/css";
import { SyntaxMappingError, defineShikiTheme } from "@untheme/shiki";
import { bootUntheme, mockTheme } from "@untheme/testing";

import { MAP, OPTIONS } from "../src/theme";

/*
 * The carriers that the interchange binds, over a stand-in for aurora. The
 * stand-in has two stops of two ramps in place of the hundreds of tokens of
 * the preset. Its dark context rebinds the carriers the way
 * `tokens/syntax-dark.json` does. The tests check the map against this
 * contract without a kit build. Every role in the map must name a color
 * carrier here.
 */
const theme = mockTheme({
  tokens: {
    "primary-400": "#60a5fa",
    "primary-600": "#2563eb",
    "neutral-100": "#f5f5f5",
    "neutral-900": "#171717",
    "surface-container": "{neutral-100}",
    "syntax-text": "{neutral-900}",
    "syntax-keyword": "{primary-600}",
    "syntax-string": "{primary-600}",
    "syntax-regex": "{primary-600}",
    "syntax-comment": "{neutral-900}",
    "syntax-number": "{primary-600}",
    "syntax-function": "{primary-600}",
    "syntax-builtin": "{primary-600}",
    "syntax-tag": "{primary-600}",
    "syntax-type": "{primary-600}",
    "syntax-parameter": "{neutral-900}",
    "syntax-variable": "{neutral-900}",
    "syntax-property": "{neutral-900}",
    "syntax-operator": "{neutral-900}",
    "weight-bold": 700,
  },
  modifiers: {
    color: {
      light: {},
      dark: {
        "surface-container": "{neutral-900}",
        "syntax-text": "{neutral-100}",
        "syntax-keyword": "{primary-400}",
      },
    },
  },
});

describe("the interchange", () => {
  it("binds every role to a color carrier the contract defines", () => {
    const untheme = bootUntheme(theme);
    expect(() => defineShikiTheme(untheme.schema, MAP, OPTIONS)).not.toThrow();
    for (const token of Object.values(MAP)) {
      expect(untheme.schema.check.token(token)).toBe(true);
      expect(untheme.schema.base.tokens[token].$type).toBe("color");
    }
  });

  it("wires each scope to the var() of its carrier, never a color", () => {
    const untheme = bootUntheme(theme);
    const shiki = defineShikiTheme(untheme.schema, MAP, OPTIONS);
    const keyword = shiki.settings?.find((rule) => rule.scope === "keyword");
    expect(keyword?.settings.foreground).toBe("var(--syntax-keyword)");
    expect(shiki.name).toBe("aurora-syntax");
    expect(shiki.fg).toBe("var(--syntax-text)");
    expect(shiki.bg).toBe("var(--surface-container)");
    for (const rule of shiki.settings ?? []) {
      if (rule.settings.foreground !== undefined) {
        expect(rule.settings.foreground).toMatch(/^var\(--syntax-/);
      }
    }
  });

  it("rejects a role bound to a token that is not a color", () => {
    const untheme = bootUntheme(theme);
    expect(() =>
      defineShikiTheme(untheme.schema, { ...MAP, keyword: "weight-bold" }),
    ).toThrow(SyntaxMappingError);
  });
});

describe("the cascade", () => {
  it("re-themes the highlighted code by rebinding the carriers", () => {
    const untheme = bootUntheme(theme);
    const renderer = defineRenderer(untheme);
    const shiki = defineShikiTheme(untheme.schema, MAP, OPTIONS);
    const before = structuredClone(shiki);

    expect(renderer.value("syntax-keyword")).toBe("var(--primary-600)");
    untheme.swap("color", "dark");
    expect(renderer.value("syntax-keyword")).toBe("var(--primary-400)");
    expect(renderer.value("surface-container")).toBe("var(--neutral-900)");

    /* The Shiki theme is static. A swap does not regenerate it. */
    expect(shiki).toEqual(before);
  });

  it("rebinds every carrier the dark context names under its own block", () => {
    const untheme = bootUntheme(theme);
    const sheet = defineRenderer(untheme).sheet();
    expect(sheet).toContain('[data-color="dark"]');
    expect(sheet).toMatch(/--syntax-keyword:\s*var\(--primary-400\)/);
  });
});
