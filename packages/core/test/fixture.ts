import type { Color, Contract } from "@untheme/schema";

/* The token names the fixture declares. */
export type Tok =
  | "color.white"
  | "color.black"
  | "color.accent"
  | "color.bg"
  | "color.fg"
  | "space.sm"
  | "border.thin"
  | "gradient.fade";

/* The modifier axes and their contexts. */
export type Mod = {
  mode: { light: object; dark: object };
  contrast: { normal: object; high: object };
};

/* The structured colors that the assertions compare against. */
export const white: Color = { colorSpace: "srgb", components: [1, 1, 1] };
export const black: Color = { colorSpace: "srgb", components: [0, 0, 0] };
export const blue: Color = { colorSpace: "srgb", components: [0, 0.5, 1] };

/**
 * A complete base theme. It has literal colors, a dimension, and alias chains
 * such as `color.bg` to `color.white`. The composite `border.thin` has
 * references as sub-values. The composite `gradient.fade` references one token
 * twice. Two modifiers have bare bindings.
 */
export const theme: Contract<Tok, Mod> = {
  id: "demo",
  name: "Demo",
  tokens: {
    "color.white": { $type: "color", $value: white },
    "color.black": { $type: "color", $value: black },
    "color.accent": { $type: "color", $value: blue },
    "color.bg": { $type: "color", $value: "{color.white}" },
    "color.fg": { $type: "color", $value: "{color.black}" },
    "space.sm": { $type: "dimension", $value: { value: 4, unit: "px" } },
    "border.thin": {
      $type: "border",
      $value: { color: "{color.accent}", width: "{space.sm}", style: "solid" },
    },
    "gradient.fade": {
      $type: "gradient",
      $value: [
        { color: "{color.fg}", position: 0 },
        { color: "{color.fg}", position: 1 },
      ],
    },
  },
  modifiers: {
    mode: {
      light: { "color.bg": "{color.white}", "color.fg": "{color.black}" },
      dark: { "color.bg": "{color.black}", "color.fg": "{color.white}" },
    },
    contrast: {
      normal: {},
      high: { "color.fg": "{color.black}" },
    },
  },
  order: ["mode", "contrast"],
};
