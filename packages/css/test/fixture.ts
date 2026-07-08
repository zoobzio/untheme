import type { Color, Contract } from "@untheme/schema";

/* The token names the fixture declares. */
export type Tok =
  | "color.white"
  | "color.ink"
  | "color.paper"
  | "color.mist"
  | "color.accent"
  | "space.sm"
  | "time.fast"
  | "font.stack"
  | "font.mono"
  | "weight.bold"
  | "scale.half"
  | "ease.smooth"
  | "stroke.solid"
  | "stroke.dashed"
  | "edge.card"
  | "move.fade"
  | "depth.low"
  | "depth.stack"
  | "fade.hero"
  | "type.body"
  | "type.display";

/* The modifier axes and their contexts. */
export type Mod = {
  mode: { light: object; dark: object };
};

/* Structured colors named once so assertions can compare against them. */
export const white: Color = { colorSpace: "srgb", components: [1, 1, 1] };
export const ink: Color = {
  colorSpace: "oklch",
  components: [0.32, 0.02, 260],
  alpha: 0.9,
};

/**
 * A complete base theme exercising every token type: literal scalars, a hex
 * fallback, an hsl color with a `none` channel, whole-value references
 * (`color.accent`, `type.display`), composites whose slots are references
 * (`edge.card`, `move.fade`, `fade.hero`), a shadow list holding a reference
 * as a layer (`depth.stack`), and a `mode` axis whose default context is
 * empty and whose `dark` context carries overrides.
 */
export const theme: Contract<Tok, Mod> = {
  id: "spectrum",
  name: "Spectrum",
  tokens: {
    "color.white": { $type: "color", $value: white },
    "color.ink": { $type: "color", $value: ink },
    "color.paper": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.98, 0.97, 0.95],
        hex: "#faf7f2",
      },
    },
    "color.mist": {
      $type: "color",
      $value: { colorSpace: "hsl", components: [120, 50, "none"] },
    },
    "color.accent": { $type: "color", $value: "{color.ink}" },
    "space.sm": { $type: "dimension", $value: { value: 4, unit: "px" } },
    "time.fast": { $type: "duration", $value: { value: 150, unit: "ms" } },
    "font.stack": {
      $type: "fontFamily",
      $value: ["Helvetica Neue", "sans-serif"],
    },
    "font.mono": { $type: "fontFamily", $value: "monospace" },
    "weight.bold": { $type: "fontWeight", $value: "semi-bold" },
    "scale.half": { $type: "number", $value: 0.5 },
    "ease.smooth": { $type: "cubicBezier", $value: [0.4, 0, 0.2, 1] },
    "stroke.solid": { $type: "strokeStyle", $value: "solid" },
    "stroke.dashed": {
      $type: "strokeStyle",
      $value: { dashArray: [{ value: 2, unit: "px" }], lineCap: "round" },
    },
    "edge.card": {
      $type: "border",
      $value: { color: "{color.accent}", width: "{space.sm}", style: "solid" },
    },
    "move.fade": {
      $type: "transition",
      $value: {
        duration: "{time.fast}",
        delay: { value: 0, unit: "ms" },
        timingFunction: "{ease.smooth}",
      },
    },
    "depth.low": {
      $type: "shadow",
      $value: {
        color: ink,
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 1, unit: "px" },
        blur: { value: 2, unit: "px" },
        spread: { value: 0, unit: "px" },
      },
    },
    "depth.stack": {
      $type: "shadow",
      $value: [
        "{depth.low}",
        {
          color: "{color.ink}",
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 4, unit: "px" },
          blur: { value: 8, unit: "px" },
          spread: { value: -2, unit: "px" },
        },
      ],
    },
    "fade.hero": {
      $type: "gradient",
      $value: [
        { color: "{color.ink}", position: 0 },
        { color: white, position: "{scale.half}" },
        { color: white, position: 1 },
      ],
    },
    "type.body": {
      $type: "typography",
      $value: {
        fontFamily: "{font.stack}",
        fontSize: { value: 1, unit: "rem" },
        fontWeight: 400,
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: 1.5,
      },
    },
    "type.display": { $type: "typography", $value: "{type.body}" },
  },
  modifiers: {
    mode: {
      light: {},
      dark: {
        "color.paper": { colorSpace: "srgb", components: [0.1, 0.1, 0.12] },
        "color.accent": "{color.white}",
      },
    },
  },
  order: ["mode"],
};
