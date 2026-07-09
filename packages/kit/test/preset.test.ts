import type { Color, Contract } from "@untheme/schema";

import { describe, it, expect } from "vitest";

import { defineUntheme, makeUntheme } from "@untheme/core";

import { defineUnthemePreset } from "../src/preset";

/* The token names the base declares. */
type Tok = "white" | "black" | "blue" | "background" | "foreground" | "primary";

/* The modifier axis and its contexts. */
type Mod = {
  color: { light: object; dark: object };
};

const white: Color = { colorSpace: "srgb", components: [1, 1, 1] };
const black: Color = { colorSpace: "srgb", components: [0, 0, 0] };
const blue: Color = { colorSpace: "srgb", components: [0, 0, 1] };
const navy: Color = { colorSpace: "srgb", components: [0.12, 0.25, 0.69] };
const red: Color = { colorSpace: "srgb", components: [1, 0, 0] };

const base: Contract<Tok, Mod> = {
  id: "base",
  name: "Base",
  tokens: {
    white: { $type: "color", $value: white },
    black: { $type: "color", $value: black },
    blue: { $type: "color", $value: blue },
    background: { $type: "color", $value: "{white}" },
    foreground: { $type: "color", $value: "{black}" },
    primary: { $type: "color", $value: "{foreground}" },
  },
  modifiers: {
    color: {
      light: { background: "{white}", foreground: "{black}" },
      dark: { background: "{black}", foreground: "{white}" },
    },
  },
  order: ["color"],
};

const preset = defineUnthemePreset(base);

describe("defineUnthemePreset", () => {
  describe("define", () => {
    it("resolves a layer to a complete theme under its identity", () => {
      const theme = preset.define({
        id: "brand",
        name: "Brand",
        tokens: { blue: navy },
        modifiers: { color: { dark: { foreground: "{blue}" } } },
      });
      expect(theme.id).toBe("brand");
      expect(theme.tokens.blue.$value).toEqual(navy);
      expect(theme.tokens.blue.$type).toBe("color");
      expect(theme.modifiers.color.dark.foreground).toBe("{blue}");
      expect(theme.modifiers.color.light).toEqual(base.modifiers.color.light);
    });

    it("leaves the base untouched", () => {
      preset.define({
        id: "brand",
        name: "Brand",
        tokens: { blue: navy },
      });
      expect(base.tokens.blue.$value).toBe(blue);
    });
  });

  describe("configure", () => {
    const app = preset.configure({
      id: "app",
      name: "App",
      tokens: {
        blue: navy,
        red: { $type: "color", $value: red },
        danger: { $type: "color", $value: "{red}" },
      },
      modifiers: {
        color: {
          light: { danger: "{red}" },
          dark: { danger: "{red}" },
        },
        density: {
          compact: { danger: "{blue}" },
          cozy: {},
        },
      },
      order: ["density"],
    });

    it("derives a preset widened by the extension, under its identity", () => {
      const config = app.use({ color: "light", density: "cozy" });
      expect(config.theme.id).toBe("app");
      expect(config.theme.name).toBe("App");
      // new tokens join the contract, overrides win, base survives underneath
      expect(config.theme.tokens.red).toEqual({ $type: "color", $value: red });
      expect(config.theme.tokens.blue.$value).toEqual(navy);
      expect(config.theme.tokens.blue.$type).toBe("color");
      expect(config.theme.tokens.white.$value).toEqual(white);
      expect(config.theme.tokens.danger.$value).toBe("{red}");
      expect(config.theme.modifiers.color.light.danger).toBe("{red}");
      expect(config.theme.modifiers.color.light.background).toBe("{white}");
      // the new axis arrives wholesale and joins the order
      expect(config.theme.modifiers.density).toEqual({
        compact: { danger: "{blue}" },
        cozy: {},
      });
      expect(config.theme.order).toEqual(["color", "density"]);
    });

    it("resolves derived variants against the widened base", () => {
      const theme = app.define({
        id: "night",
        name: "Night",
        tokens: { red: { colorSpace: "srgb", components: [0.67, 0, 0] } },
      });
      expect(theme.tokens.red.$value).toEqual({
        colorSpace: "srgb",
        components: [0.67, 0, 0],
      });
      expect(theme.tokens.blue.$value).toEqual(navy);
    });

    it("leaves the original preset untouched", () => {
      expect(preset.use({ color: "light" }).theme.tokens).not.toHaveProperty(
        "red",
      );
      expect(base.tokens.blue.$value).toBe(blue);
    });

    it("produces a schema-valid theme a service accepts end to end", () => {
      const service = makeUntheme(
        app.use({ color: "dark", density: "compact" }),
      );
      // density.compact rebinds danger to {blue}; blue was rebound to navy
      expect(service.resolve("danger")).toEqual(navy);
      service.swap("density", "cozy");
      expect(service.resolve("danger")).toEqual(red);
    });

    it("chains: a widened preset configures again", () => {
      const twice = app.configure({
        id: "app-2",
        name: "App 2",
        tokens: {
          accent: { $type: "color", $value: "{danger}" },
        },
        modifiers: {
          density: { compact: { accent: "{red}" } },
        },
        order: [],
      });
      const config = twice.use({ color: "light", density: "compact" });
      expect(config.theme.id).toBe("app-2");
      expect(config.theme.tokens.accent.$value).toBe("{danger}");
      expect(config.theme.tokens.red.$value).toEqual(red);
      expect(config.theme.modifiers.density.compact).toEqual({
        danger: "{blue}",
        accent: "{red}",
      });
      expect(config.theme.order).toEqual(["color", "density"]);

      const service = makeUntheme(config);
      expect(service.resolve("accent")).toEqual(red);
    });
  });

  describe("use", () => {
    it("builds a config from a detached copy of the base", () => {
      const config = preset.use({ color: "dark" });
      expect(config.input).toEqual({ color: "dark" });
      expect(config.override).toEqual({});
      expect(config.theme).toEqual(base);
      expect(config.theme).not.toBe(base);
      config.theme.tokens.white.$value = black;
      expect(preset.use({ color: "dark" }).theme.tokens.white.$value).toEqual(
        white,
      );
    });

    it("feeds defineUntheme directly", () => {
      const service = defineUntheme(preset.use({ color: "dark" }));
      expect(service.get("background")).toBe("{black}");
      expect(service.resolve("background")).toEqual(black);
    });
  });
});

/**
 * Type-level coverage for the widening chain. The `@ts-expect-error`
 * directives are checked by `tsc --noEmit` (the package typecheck), which
 * reads this file through the tsconfig `include`. The runtime bodies only
 * exist so the suite is a valid test; the assertions that matter are the
 * compile-time ones.
 */
describe("preset types", () => {
  const widened = preset.configure({
    id: "brand",
    name: "Brand",
    tokens: { accent: { $type: "color", $value: "{blue}" } },
    modifiers: {
      color: { dark: { accent: "{white}" } },
      density: { compact: { accent: "{blue}" }, cozy: {} },
    },
    order: ["density"],
  });

  it("checks the extension against the known contract", () => {
    preset.configure({
      id: "e",
      name: "E",
      tokens: {},
      // @ts-expect-error ghost is not a token of the contract
      modifiers: { color: { dark: { ghost: "{white}" } } },
      order: [],
    });
    preset.configure({
      id: "e",
      name: "E",
      tokens: {},
      // @ts-expect-error twilight is not a context of the color axis
      modifiers: { color: { twilight: { background: "{white}" } } },
      order: [],
    });
    expect(true).toBe(true);
  });

  it("keeps token, axis, and context keys literal after a configure", () => {
    widened.define({ id: "v", name: "V", tokens: { accent: "{background}" } });
    widened.define({
      id: "v",
      name: "V",
      // @ts-expect-error unknown token must be rejected on the widened preset
      tokens: { ghost: "{background}" },
    });

    widened.use({ color: "dark", density: "compact" });
    // @ts-expect-error unknown context on the new axis must be rejected
    widened.use({ color: "dark", density: "roomy" });
    // @ts-expect-error unknown context on the base axis must be rejected
    widened.use({ color: "dim", density: "compact" });
    // @ts-expect-error a missing axis must be rejected
    widened.use({ color: "dark" });
    expect(true).toBe(true);
  });

  it("keeps checking and precision through a second configure", () => {
    const twice = widened.configure({
      id: "b2",
      name: "B2",
      tokens: {},
      // @ts-expect-error ghost is not a token of the widened contract
      modifiers: { density: { compact: { ghost: "{accent}" } } },
      order: [],
    });
    void twice;

    const chained = widened.configure({
      id: "b3",
      name: "B3",
      tokens: { detail: { $type: "color", $value: "{accent}" } },
      modifiers: {},
      order: [],
    });
    chained.define({ id: "v", name: "V", tokens: { detail: "{blue}" } });
    chained.define({
      id: "v",
      name: "V",
      // @ts-expect-error unknown token must be rejected after two configures
      tokens: { ghost: "{blue}" },
    });
    chained.use({ color: "light", density: "cozy" });
    // @ts-expect-error unknown context must be rejected after two configures
    chained.use({ color: "light", density: "roomy" });
    expect(true).toBe(true);
  });
});
