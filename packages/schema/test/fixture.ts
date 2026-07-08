import { defineMeta } from "../src/meta";
import type { Code, Issue, Rule, Template } from "../src/types";

/* A dimension used often enough to name once. */
export const zero = { value: 0, unit: "px" } as const;

/**
 * A realistic template that exercises every token type, a composite that
 * references another composite, two modifier axes with contexts, and aliases
 * between tokens. Shared by the suites so each does not restate a contract.
 */
export const template = {
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
    },
    "color.accent": { $type: "color", $value: "{color.fg}" },
    "space.sm": { $type: "dimension", $value: { value: 4, unit: "px" } },
    "space.md": { $type: "dimension", $value: { value: 1, unit: "rem" } },
    "time.fast": { $type: "duration", $value: { value: 150, unit: "ms" } },
    "font.body": { $type: "fontFamily", $value: ["Inter", "sans-serif"] },
    "font.mono": { $type: "fontFamily", $value: "monospace" },
    "weight.bold": { $type: "fontWeight", $value: "bold" },
    "weight.heavy": { $type: "fontWeight", $value: 700 },
    "opacity.half": { $type: "number", $value: 0.5 },
    "ease.inout": { $type: "cubicBezier", $value: [0.4, 0, 0.2, 1] },
    "stroke.dashed": { $type: "strokeStyle", $value: "dashed" },
    "stroke.custom": {
      $type: "strokeStyle",
      $value: {
        dashArray: [{ value: 2, unit: "px" }, "{space.sm}"],
        lineCap: "round",
      },
    },
    "border.thin": {
      $type: "border",
      $value: { color: "{color.fg}", width: "{space.sm}", style: "solid" },
    },
    "motion.slide": {
      $type: "transition",
      $value: {
        duration: "{time.fast}",
        delay: { value: 0, unit: "ms" },
        timingFunction: "{ease.inout}",
      },
    },
    "shadow.sm": {
      $type: "shadow",
      $value: {
        color: "{color.fg}",
        offsetX: zero,
        offsetY: { value: 1, unit: "px" },
        blur: { value: 2, unit: "px" },
        spread: zero,
      },
    },
    "shadow.layered": {
      $type: "shadow",
      $value: [
        {
          color: "{color.fg}",
          offsetX: zero,
          offsetY: { value: 1, unit: "px" },
          blur: { value: 2, unit: "px" },
          spread: zero,
        },
        "{shadow.sm}",
      ],
    },
    "gradient.fade": {
      $type: "gradient",
      $value: [
        { color: "{color.bg}", position: 0 },
        { color: "{color.fg}", position: 1 },
      ],
    },
    "type.heading": {
      $type: "typography",
      $value: {
        fontFamily: "{font.body}",
        fontSize: "{space.md}",
        fontWeight: "{weight.bold}",
        letterSpacing: zero,
        lineHeight: 1.2,
      },
    },
  },
  modifiers: {
    mode: {
      light: { "color.bg": { colorSpace: "srgb", components: [1, 1, 1] } },
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
} satisfies Template;

/** The derived meta for the fixture, shared by the validator-family suites. */
export const meta = defineMeta(template);

/** Runs a rule list and returns the first issue any rule raises. */
export const first = (rules: Rule[], v: unknown): Issue | undefined => {
  for (const rule of rules) {
    const issue = rule(v);
    if (issue) {
      return issue;
    }
  }
  return undefined;
};

/** Every issue code a rule list raises for a value, in order. */
export const codes = (rules: Rule[], v: unknown): Code[] => {
  const found: Code[] = [];
  for (const rule of rules) {
    const issue = rule(v);
    if (issue) {
      found.push(issue.code);
    }
  }
  return found;
};
