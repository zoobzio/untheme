import type { Contract } from "@untheme/schema";

/* The token names the fixture declares. */
export type Tok =
  | "color.bg"
  | "color.fg"
  | "color.accent"
  | "space.md"
  | "shadow.sm";

/* The modifier axes and their contexts. */
export type Mod = {
  mode: { light: object; dark: object };
  contrast: { normal: object; high: object };
};

export const zero = { value: 0, unit: "px" } as const;

/**
 * A complete base theme with structured `$value`s. It has a color with a
 * components array, a shadow list, a dimension, and alias references. Two
 * modifiers have bare bindings.
 */
export const theme: Contract<Tok, Mod> = {
  id: "demo",
  name: "Demo",
  tokens: {
    "color.bg": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1] },
    },
    "color.fg": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 1 },
      $description: "Foreground",
    },
    "color.accent": { $type: "color", $value: "{color.fg}" },
    "space.md": { $type: "dimension", $value: { value: 8, unit: "px" } },
    "shadow.sm": {
      $type: "shadow",
      $value: [
        {
          color: "{color.fg}",
          offsetX: zero,
          offsetY: { value: 1, unit: "px" },
          blur: { value: 2, unit: "px" },
          spread: zero,
        },
        "{color.accent}",
      ],
    },
  },
  modifiers: {
    mode: {
      light: {},
      dark: {
        "color.bg": { colorSpace: "srgb", components: [0, 0, 0] },
        "color.fg": "{color.bg}",
      },
    },
    contrast: {
      normal: {},
      high: { "color.fg": { colorSpace: "srgb", components: [0, 0, 0] } },
    },
  },
  order: ["mode", "contrast"],
};
