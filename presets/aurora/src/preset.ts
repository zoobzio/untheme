import { defineUnthemePreset } from "@untheme/kit";

import { ramps } from "./ramps";

/**
 * The Aurora preset.
 *
 * The reference untheme preset: eight functional tonal ramps — primary,
 * secondary, tertiary, error, success, warning, neutral, and
 * neutral-variant — at the eleven Tailwind-style stops (50–950), carrying a
 * deliberately small semantic vocabulary: color roles, a five-style type
 * scale, shape radii, a spacing scale, elevation shadows, motion, and
 * state-layer opacities. Every color role binds a ramp stop by reference,
 * so a theme variant rebinds only the ramp values and every role and
 * context follows. Every token type the schema validates appears at least
 * once.
 *
 * Six modifier axes compose in `order`: `color` (light/dark) rebinds the
 * color roles; `contrast` (default/medium/high) re-points shifted roles at
 * the `*-medium-contrast` / `*-high-contrast` channel tokens; `text`
 * (sm/md/lg) rebinds the type-scale sizes; `density`
 * (compact/default/spacious) rebinds the spacing scale; `radius`
 * (sharp/default/round) rebinds the shape radii; `motion`
 * (default/reduced) zeroes the durations. The axes override disjoint token
 * sets — except `color` and `contrast`, which deliberately collide on the
 * shifted roles: what "higher contrast" means depends on the mode, so each
 * color context also sets the channel tokens for its mode, and the
 * contrast contexts override roles with mode-independent references whose
 * targets the color axis already resolved. `contrast` follows `color` in
 * `order`, so its override wins the collision.
 */
export const preset = defineUnthemePreset({
  id: "aurora",
  name: "Aurora",
  tokens: {
    // Tonal ramps — eight generated palettes at the eleven stops
    ...ramps,

    // Accent roles — fill, text-on-fill, tinted container, text-on-container
    primary: { $type: "color", $value: "{primary-600}" },
    "on-primary": { $type: "color", $value: "{primary-50}" },
    "primary-container": { $type: "color", $value: "{primary-100}" },
    "on-primary-container": { $type: "color", $value: "{primary-800}" },
    secondary: { $type: "color", $value: "{secondary-600}" },
    "on-secondary": { $type: "color", $value: "{secondary-50}" },
    "secondary-container": { $type: "color", $value: "{secondary-100}" },
    "on-secondary-container": { $type: "color", $value: "{secondary-800}" },
    tertiary: { $type: "color", $value: "{tertiary-600}" },
    "on-tertiary": { $type: "color", $value: "{tertiary-50}" },
    "tertiary-container": { $type: "color", $value: "{tertiary-100}" },
    "on-tertiary-container": { $type: "color", $value: "{tertiary-800}" },
    error: { $type: "color", $value: "{error-600}" },
    "on-error": { $type: "color", $value: "{error-50}" },
    "error-container": { $type: "color", $value: "{error-100}" },
    "on-error-container": { $type: "color", $value: "{error-800}" },
    success: { $type: "color", $value: "{success-600}" },
    "on-success": { $type: "color", $value: "{success-50}" },
    "success-container": { $type: "color", $value: "{success-100}" },
    "on-success-container": { $type: "color", $value: "{success-800}" },
    warning: { $type: "color", $value: "{warning-600}" },
    "on-warning": { $type: "color", $value: "{warning-50}" },
    "warning-container": { $type: "color", $value: "{warning-100}" },
    "on-warning-container": { $type: "color", $value: "{warning-800}" },

    // Surface roles
    surface: { $type: "color", $value: "{neutral-50}" },
    "on-surface": { $type: "color", $value: "{neutral-800}" },
    "on-surface-muted": { $type: "color", $value: "{neutral-600}" },
    "surface-container": { $type: "color", $value: "{neutral-100}" },
    "surface-container-high": { $type: "color", $value: "{neutral-200}" },
    outline: { $type: "color", $value: "{neutral-variant-400}" },
    "outline-muted": { $type: "color", $value: "{neutral-variant-200}" },
    scrim: { $type: "color", $value: "{neutral-950}" },

    // Contrast channels — the light scheme's shift targets; the dark
    // context rebinds each channel to its own targets
    "on-surface-medium-contrast": { $type: "color", $value: "{neutral-900}" },
    "on-surface-high-contrast": { $type: "color", $value: "{neutral-950}" },
    "on-surface-muted-medium-contrast": {
      $type: "color",
      $value: "{neutral-700}",
    },
    "on-surface-muted-high-contrast": {
      $type: "color",
      $value: "{neutral-800}",
    },
    "outline-medium-contrast": {
      $type: "color",
      $value: "{neutral-variant-500}",
    },
    "outline-high-contrast": {
      $type: "color",
      $value: "{neutral-variant-600}",
    },
    "primary-medium-contrast": { $type: "color", $value: "{primary-700}" },
    "primary-high-contrast": { $type: "color", $value: "{primary-800}" },
    "on-primary-container-medium-contrast": {
      $type: "color",
      $value: "{primary-900}",
    },
    "on-primary-container-high-contrast": {
      $type: "color",
      $value: "{primary-950}",
    },
    "secondary-medium-contrast": { $type: "color", $value: "{secondary-700}" },
    "secondary-high-contrast": { $type: "color", $value: "{secondary-800}" },
    "on-secondary-container-medium-contrast": {
      $type: "color",
      $value: "{secondary-900}",
    },
    "on-secondary-container-high-contrast": {
      $type: "color",
      $value: "{secondary-950}",
    },
    "tertiary-medium-contrast": { $type: "color", $value: "{tertiary-700}" },
    "tertiary-high-contrast": { $type: "color", $value: "{tertiary-800}" },
    "on-tertiary-container-medium-contrast": {
      $type: "color",
      $value: "{tertiary-900}",
    },
    "on-tertiary-container-high-contrast": {
      $type: "color",
      $value: "{tertiary-950}",
    },
    "error-medium-contrast": { $type: "color", $value: "{error-700}" },
    "error-high-contrast": { $type: "color", $value: "{error-800}" },
    "on-error-container-medium-contrast": {
      $type: "color",
      $value: "{error-900}",
    },
    "on-error-container-high-contrast": {
      $type: "color",
      $value: "{error-950}",
    },
    "success-medium-contrast": { $type: "color", $value: "{success-700}" },
    "success-high-contrast": { $type: "color", $value: "{success-800}" },
    "on-success-container-medium-contrast": {
      $type: "color",
      $value: "{success-900}",
    },
    "on-success-container-high-contrast": {
      $type: "color",
      $value: "{success-950}",
    },
    "warning-medium-contrast": { $type: "color", $value: "{warning-700}" },
    "warning-high-contrast": { $type: "color", $value: "{warning-800}" },
    "on-warning-container-medium-contrast": {
      $type: "color",
      $value: "{warning-900}",
    },
    "on-warning-container-high-contrast": {
      $type: "color",
      $value: "{warning-950}",
    },

    // Typography — families, weights, and per-style size and leading
    "font-sans": {
      $type: "fontFamily",
      $value: ["Inter", "system-ui", "sans-serif"],
    },
    "font-mono": {
      $type: "fontFamily",
      $value: ["JetBrains Mono", "monospace"],
    },
    "weight-regular": { $type: "fontWeight", $value: 400 },
    "weight-medium": { $type: "fontWeight", $value: 500 },
    "weight-bold": { $type: "fontWeight", $value: 700 },
    "display-size": { $type: "dimension", $value: { value: 3, unit: "rem" } },
    "headline-size": { $type: "dimension", $value: { value: 2, unit: "rem" } },
    "title-size": { $type: "dimension", $value: { value: 1.25, unit: "rem" } },
    "body-size": { $type: "dimension", $value: { value: 1, unit: "rem" } },
    "label-size": { $type: "dimension", $value: { value: 0.875, unit: "rem" } },
    "display-line-height": { $type: "number", $value: 1.15 },
    "headline-line-height": { $type: "number", $value: 1.25 },
    "title-line-height": { $type: "number", $value: 1.4 },
    "body-line-height": { $type: "number", $value: 1.5 },
    "label-line-height": { $type: "number", $value: 1.35 },

    // Type styles — one composite per style; sizes and leading arrive
    // through sub-value references, so the text axis re-scales these
    // without touching them
    "type-display": {
      $type: "typography",
      $value: {
        fontFamily: "{font-sans}",
        fontSize: "{display-size}",
        fontWeight: "{weight-bold}",
        letterSpacing: { value: -0.5, unit: "px" },
        lineHeight: "{display-line-height}",
      },
    },
    "type-headline": {
      $type: "typography",
      $value: {
        fontFamily: "{font-sans}",
        fontSize: "{headline-size}",
        fontWeight: "{weight-bold}",
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: "{headline-line-height}",
      },
    },
    "type-title": {
      $type: "typography",
      $value: {
        fontFamily: "{font-sans}",
        fontSize: "{title-size}",
        fontWeight: "{weight-medium}",
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: "{title-line-height}",
      },
    },
    "type-body": {
      $type: "typography",
      $value: {
        fontFamily: "{font-sans}",
        fontSize: "{body-size}",
        fontWeight: "{weight-regular}",
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: "{body-line-height}",
      },
    },
    "type-label": {
      $type: "typography",
      $value: {
        fontFamily: "{font-sans}",
        fontSize: "{label-size}",
        fontWeight: "{weight-medium}",
        letterSpacing: { value: 0.5, unit: "px" },
        lineHeight: "{label-line-height}",
      },
    },

    // Shape radii
    "shape-sm": { $type: "dimension", $value: { value: 4, unit: "px" } },
    "shape-md": { $type: "dimension", $value: { value: 8, unit: "px" } },
    "shape-lg": { $type: "dimension", $value: { value: 16, unit: "px" } },
    "shape-full": { $type: "dimension", $value: { value: 9999, unit: "px" } },

    // Spacing scale
    "space-1": { $type: "dimension", $value: { value: 0.25, unit: "rem" } },
    "space-2": { $type: "dimension", $value: { value: 0.5, unit: "rem" } },
    "space-3": { $type: "dimension", $value: { value: 0.75, unit: "rem" } },
    "space-4": { $type: "dimension", $value: { value: 1, unit: "rem" } },
    "space-5": { $type: "dimension", $value: { value: 1.5, unit: "rem" } },
    "space-6": { $type: "dimension", $value: { value: 2, unit: "rem" } },
    "space-7": { $type: "dimension", $value: { value: 3, unit: "rem" } },
    "space-8": { $type: "dimension", $value: { value: 4, unit: "rem" } },

    // Elevation shadows
    "elevation-none": {
      $type: "shadow",
      $value: {
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 0, unit: "px" },
        blur: { value: 0, unit: "px" },
        spread: { value: 0, unit: "px" },
      },
    },
    "elevation-low": {
      $type: "shadow",
      $value: {
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 1, unit: "px" },
        blur: { value: 2, unit: "px" },
        spread: { value: 0, unit: "px" },
      },
    },
    "elevation-mid": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 2, unit: "px" },
          blur: { value: 4, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.1 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 4, unit: "px" },
          blur: { value: 8, unit: "px" },
          spread: { value: -2, unit: "px" },
        },
      ],
    },
    "elevation-high": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 4, unit: "px" },
          blur: { value: 8, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.1 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 8, unit: "px" },
          blur: { value: 16, unit: "px" },
          spread: { value: -4, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.05 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 16, unit: "px" },
          blur: { value: 32, unit: "px" },
          spread: { value: -8, unit: "px" },
        },
      ],
    },

    // State-layer opacities
    "state-hover": { $type: "number", $value: 0.08 },
    "state-focus": { $type: "number", $value: 0.12 },
    "state-press": { $type: "number", $value: 0.16 },

    // Motion — durations, easings, and ready-made transitions
    "duration-fast": {
      $type: "duration",
      $value: { value: 150, unit: "ms" },
    },
    "duration-base": {
      $type: "duration",
      $value: { value: 250, unit: "ms" },
    },
    "duration-slow": {
      $type: "duration",
      $value: { value: 400, unit: "ms" },
    },
    "easing-standard": { $type: "cubicBezier", $value: [0.2, 0, 0, 1] },
    "easing-enter": { $type: "cubicBezier", $value: [0.05, 0.7, 0.1, 1] },
    "easing-exit": { $type: "cubicBezier", $value: [0.3, 0, 0.8, 0.15] },
    "transition-fast": {
      $type: "transition",
      $value: {
        duration: "{duration-fast}",
        timingFunction: "{easing-standard}",
        delay: { value: 0, unit: "ms" },
      },
    },
    "transition-base": {
      $type: "transition",
      $value: {
        duration: "{duration-base}",
        timingFunction: "{easing-standard}",
        delay: { value: 0, unit: "ms" },
      },
    },
    "transition-slow": {
      $type: "transition",
      $value: {
        duration: "{duration-slow}",
        timingFunction: "{easing-standard}",
        delay: { value: 0, unit: "ms" },
      },
    },

    // Strokes and borders
    "stroke-solid": { $type: "strokeStyle", $value: "solid" },
    "stroke-dashed": {
      $type: "strokeStyle",
      $value: {
        dashArray: [
          { value: 4, unit: "px" },
          { value: 2, unit: "px" },
        ],
        lineCap: "round",
      },
    },
    "border-thin": {
      $type: "border",
      $value: {
        color: "{outline}",
        width: { value: 1, unit: "px" },
        style: "{stroke-solid}",
      },
    },
    "border-strong": {
      $type: "border",
      $value: {
        color: "{outline}",
        width: { value: 2, unit: "px" },
        style: "{stroke-solid}",
      },
    },

    // Gradients
    "gradient-brand": {
      $type: "gradient",
      $value: [
        { color: "{primary-400}", position: 0 },
        { color: "{tertiary-400}", position: 1 },
      ],
    },
  },
  modifiers: {
    color: {
      light: {},
      dark: {
        // Accent roles
        primary: "{primary-400}",
        "on-primary": "{primary-950}",
        "primary-container": "{primary-800}",
        "on-primary-container": "{primary-200}",
        secondary: "{secondary-400}",
        "on-secondary": "{secondary-950}",
        "secondary-container": "{secondary-800}",
        "on-secondary-container": "{secondary-200}",
        tertiary: "{tertiary-400}",
        "on-tertiary": "{tertiary-950}",
        "tertiary-container": "{tertiary-800}",
        "on-tertiary-container": "{tertiary-200}",
        error: "{error-400}",
        "on-error": "{error-950}",
        "error-container": "{error-800}",
        "on-error-container": "{error-200}",
        success: "{success-400}",
        "on-success": "{success-950}",
        "success-container": "{success-800}",
        "on-success-container": "{success-200}",
        warning: "{warning-400}",
        "on-warning": "{warning-950}",
        "warning-container": "{warning-800}",
        "on-warning-container": "{warning-200}",

        // Surface roles
        surface: "{neutral-950}",
        "on-surface": "{neutral-200}",
        "on-surface-muted": "{neutral-400}",
        "surface-container": "{neutral-900}",
        "surface-container-high": "{neutral-800}",
        outline: "{neutral-variant-600}",
        "outline-muted": "{neutral-variant-800}",

        // Contrast channels — the dark scheme's shift targets
        "on-surface-medium-contrast": "{neutral-100}",
        "on-surface-high-contrast": "{neutral-50}",
        "on-surface-muted-medium-contrast": "{neutral-300}",
        "on-surface-muted-high-contrast": "{neutral-200}",
        "outline-medium-contrast": "{neutral-variant-500}",
        "outline-high-contrast": "{neutral-variant-400}",
        "primary-medium-contrast": "{primary-300}",
        "primary-high-contrast": "{primary-200}",
        "on-primary-container-medium-contrast": "{primary-100}",
        "on-primary-container-high-contrast": "{primary-50}",
        "secondary-medium-contrast": "{secondary-300}",
        "secondary-high-contrast": "{secondary-200}",
        "on-secondary-container-medium-contrast": "{secondary-100}",
        "on-secondary-container-high-contrast": "{secondary-50}",
        "tertiary-medium-contrast": "{tertiary-300}",
        "tertiary-high-contrast": "{tertiary-200}",
        "on-tertiary-container-medium-contrast": "{tertiary-100}",
        "on-tertiary-container-high-contrast": "{tertiary-50}",
        "error-medium-contrast": "{error-300}",
        "error-high-contrast": "{error-200}",
        "on-error-container-medium-contrast": "{error-100}",
        "on-error-container-high-contrast": "{error-50}",
        "success-medium-contrast": "{success-300}",
        "success-high-contrast": "{success-200}",
        "on-success-container-medium-contrast": "{success-100}",
        "on-success-container-high-contrast": "{success-50}",
        "warning-medium-contrast": "{warning-300}",
        "warning-high-contrast": "{warning-200}",
        "on-warning-container-medium-contrast": "{warning-100}",
        "on-warning-container-high-contrast": "{warning-50}",
      },
    },
    contrast: {
      default: {},
      medium: {
        "on-surface": "{on-surface-medium-contrast}",
        "on-surface-muted": "{on-surface-muted-medium-contrast}",
        outline: "{outline-medium-contrast}",
        primary: "{primary-medium-contrast}",
        "on-primary-container": "{on-primary-container-medium-contrast}",
        secondary: "{secondary-medium-contrast}",
        "on-secondary-container": "{on-secondary-container-medium-contrast}",
        tertiary: "{tertiary-medium-contrast}",
        "on-tertiary-container": "{on-tertiary-container-medium-contrast}",
        error: "{error-medium-contrast}",
        "on-error-container": "{on-error-container-medium-contrast}",
        success: "{success-medium-contrast}",
        "on-success-container": "{on-success-container-medium-contrast}",
        warning: "{warning-medium-contrast}",
        "on-warning-container": "{on-warning-container-medium-contrast}",
      },
      high: {
        "on-surface": "{on-surface-high-contrast}",
        "on-surface-muted": "{on-surface-muted-high-contrast}",
        outline: "{outline-high-contrast}",
        primary: "{primary-high-contrast}",
        "on-primary-container": "{on-primary-container-high-contrast}",
        secondary: "{secondary-high-contrast}",
        "on-secondary-container": "{on-secondary-container-high-contrast}",
        tertiary: "{tertiary-high-contrast}",
        "on-tertiary-container": "{on-tertiary-container-high-contrast}",
        error: "{error-high-contrast}",
        "on-error-container": "{on-error-container-high-contrast}",
        success: "{success-high-contrast}",
        "on-success-container": "{on-success-container-high-contrast}",
        warning: "{warning-high-contrast}",
        "on-warning-container": "{on-warning-container-high-contrast}",
      },
    },
    text: {
      sm: {
        "display-size": { value: 2.5, unit: "rem" },
        "headline-size": { value: 1.75, unit: "rem" },
        "title-size": { value: 1.125, unit: "rem" },
        "body-size": { value: 0.875, unit: "rem" },
        "label-size": { value: 0.75, unit: "rem" },
      },
      md: {},
      lg: {
        "display-size": { value: 3.5, unit: "rem" },
        "headline-size": { value: 2.25, unit: "rem" },
        "title-size": { value: 1.375, unit: "rem" },
        "body-size": { value: 1.125, unit: "rem" },
        "label-size": { value: 1, unit: "rem" },
      },
    },
    density: {
      compact: {
        "space-1": { value: 0.125, unit: "rem" },
        "space-2": { value: 0.375, unit: "rem" },
        "space-3": { value: 0.5, unit: "rem" },
        "space-4": { value: 0.75, unit: "rem" },
        "space-5": { value: 1.25, unit: "rem" },
        "space-6": { value: 1.75, unit: "rem" },
        "space-7": { value: 2.5, unit: "rem" },
        "space-8": { value: 3.5, unit: "rem" },
      },
      default: {},
      spacious: {
        "space-1": { value: 0.375, unit: "rem" },
        "space-2": { value: 0.75, unit: "rem" },
        "space-3": { value: 1, unit: "rem" },
        "space-4": { value: 1.25, unit: "rem" },
        "space-5": { value: 2, unit: "rem" },
        "space-6": { value: 2.5, unit: "rem" },
        "space-7": { value: 3.75, unit: "rem" },
        "space-8": { value: 5, unit: "rem" },
      },
    },
    radius: {
      default: {},
      sharp: {
        "shape-sm": { value: 0, unit: "px" },
        "shape-md": { value: 0, unit: "px" },
        "shape-lg": { value: 0, unit: "px" },
        "shape-full": { value: 0, unit: "px" },
      },
      // shape-full stays at its pill radius — it cannot get rounder.
      round: {
        "shape-sm": { value: 8, unit: "px" },
        "shape-md": { value: 16, unit: "px" },
        "shape-lg": { value: 24, unit: "px" },
      },
    },
    motion: {
      default: {},
      reduced: {
        "duration-fast": { value: 0, unit: "ms" },
        "duration-base": { value: 0, unit: "ms" },
        "duration-slow": { value: 0, unit: "ms" },
      },
    },
  },
  order: ["color", "contrast", "text", "density", "radius", "motion"],
});
