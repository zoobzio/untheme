import { describe, expect, it } from "vitest";

import { defineRenderer } from "untheme/css";
import { SyntaxMappingError, defineCodeMirrorTheme } from "@untheme/codemirror";
import { bootUntheme, mockTheme } from "@untheme/testing";

import { CHROME, MAP } from "../src/theme";

/*
 * The carriers that the interchange and the chrome bind, over a stand-in for
 * aurora. The stand-in has two stops of two ramps in place of the hundreds of
 * tokens of the preset. Its dark context rebinds the carriers the way
 * `tokens/syntax-dark.json` does. The tests check the map against this
 * contract without a kit build. Every tag in the map must name a color
 * carrier here.
 */
const theme = mockTheme({
  tokens: {
    "primary-400": "#60a5fa",
    "primary-600": "#2563eb",
    "neutral-100": "#f5f5f5",
    "neutral-900": "#171717",
    "surface-container-high": "{neutral-100}",
    "outline-muted": "{neutral-900}",
    "syntax-text": "{neutral-900}",
    "syntax-keyword": "{primary-600}",
    "syntax-string": "{primary-600}",
    "syntax-regex": "{primary-600}",
    "syntax-regex-constant": "{primary-600}",
    "syntax-comment": "{neutral-900}",
    "syntax-number": "{primary-600}",
    "syntax-function": "{primary-600}",
    "syntax-tag": "{primary-600}",
    "syntax-type": "{primary-600}",
    "syntax-parameter": "{neutral-900}",
    "syntax-variable": "{neutral-900}",
    "syntax-property": "{neutral-900}",
    "syntax-operator": "{neutral-900}",
    "syntax-punctuation": "{neutral-900}",
    "weight-bold": 700,
  },
  modifiers: {
    color: {
      light: {},
      dark: {
        "surface-container-high": "{neutral-900}",
        "syntax-text": "{neutral-100}",
        "syntax-keyword": "{primary-400}",
      },
    },
  },
});

describe("the interchange", () => {
  it("binds every tag and every chrome surface to a color the contract defines", () => {
    const untheme = bootUntheme(theme);
    expect(() =>
      defineCodeMirrorTheme(untheme.schema, MAP, CHROME),
    ).not.toThrow();
    for (const token of [...Object.values(MAP), ...Object.values(CHROME)]) {
      expect(untheme.schema.check.token(token)).toBe(true);
      expect(untheme.schema.base.tokens[token].$type).toBe("color");
    }
  });

  it("yields the two extensions an editor takes: chrome and highlighting", () => {
    const untheme = bootUntheme(theme);
    const extensions = defineCodeMirrorTheme(untheme.schema, MAP, CHROME);
    expect(extensions).toHaveLength(2);
  });

  it("rejects a tag bound to a token that is not a color", () => {
    const untheme = bootUntheme(theme);
    expect(() =>
      defineCodeMirrorTheme(untheme.schema, { ...MAP, keyword: "weight-bold" }),
    ).toThrow(SyntaxMappingError);
  });
});

describe("the cascade", () => {
  it("re-themes the editor by rebinding the carriers, with no reconfigure", () => {
    const untheme = bootUntheme(theme);
    const renderer = defineRenderer(untheme);

    expect(renderer.value("syntax-keyword")).toBe("var(--primary-600)");
    expect(renderer.value("surface-container-high")).toBe("var(--neutral-100)");
    untheme.swap("color", "dark");
    expect(renderer.value("syntax-keyword")).toBe("var(--primary-400)");
    expect(renderer.value("surface-container-high")).toBe("var(--neutral-900)");
  });

  it("writes the dark rebinding under the attribute the toggle flips", () => {
    const untheme = bootUntheme(theme);
    const sheet = defineRenderer(untheme).sheet();
    expect(sheet).toContain('[data-color="dark"]');
    expect(sheet).toMatch(/--syntax-keyword:\s*var\(--primary-400\)/);
  });
});
