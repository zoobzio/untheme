import { describe, it, expect } from "vitest";

import { defineUntheme } from "../src/service";
import { theme, white } from "./fixture";

describe("defineUntheme", () => {
  it("delegates to the factory, building a working service", () => {
    const u = defineUntheme({
      theme: structuredClone(theme),
      input: { mode: "light", contrast: "normal" },
      override: {},
    });
    expect(u.get("color.bg")).toBe("{color.white}");
    expect(u.resolve("color.bg")).toEqual(white);
  });
});

/**
 * Type-level coverage for the authoring contract. `defineUntheme` infers `Tok`
 * from the theme's token keys and — through `NoInfer` — checks every modifier
 * override key against that inferred set rather than widening it. The
 * `@ts-expect-error` directives are checked by the package typecheck; the
 * bodies are never called, since the assertions that matter are compile-time.
 */
describe("defineUntheme types", () => {
  it("infers the token union from the theme's own keys", () => {
    void (() =>
      defineUntheme({
        theme: {
          id: "t",
          name: "T",
          tokens: { "color.bg": { $type: "color", $value: white } },
          modifiers: {
            mode: { light: {}, dark: { "color.bg": "{color.bg}" } },
          },
          order: ["mode"],
        },
        input: { mode: "light" },
        override: {},
      }));
    expect(true).toBe(true);
  });

  it("checks modifier override keys against the inferred tokens", () => {
    void (() =>
      defineUntheme({
        theme: {
          id: "t",
          name: "T",
          tokens: { "color.bg": { $type: "color", $value: white } },
          // @ts-expect-error ghost is not a declared token of the theme
          modifiers: { mode: { light: {}, dark: { ghost: "{color.bg}" } } },
          order: ["mode"],
        },
        input: { mode: "light" },
        override: {},
      }));
    expect(true).toBe(true);
  });
});
