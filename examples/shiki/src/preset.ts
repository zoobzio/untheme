import { preset } from "@untheme/aurora";

/**
 * Aurora widened with a `syntax-*` token group — the code-highlighting
 * vocabulary `@untheme/shiki` expects, authored the same way aurora authors
 * its own roles. Each token references one of aurora's tonal ramps, and the
 * `color` axis rebinds them for the dark context, so a syntax role flips
 * light↔dark through the exact mechanism every other aurora token uses.
 *
 * `configure` derives a fresh preset over the widened contract: the base
 * tokens hold the light (default-context) values, `modifiers.color.dark`
 * carries the dark overrides, and `order: []` keeps aurora's eight axes.
 */
export const syntax = preset.configure({
  id: "aurora-syntax",
  name: "Aurora Syntax",
  tokens: {
    "syntax-text": { $type: "color", $value: "{neutral-800}" },
    "syntax-comment": { $type: "color", $value: "{neutral-500}" },
    "syntax-keyword": { $type: "color", $value: "{primary-600}" },
    "syntax-number": { $type: "color", $value: "{tertiary-600}" },
    "syntax-string": { $type: "color", $value: "{success-600}" },
    "syntax-function": { $type: "color", $value: "{secondary-600}" },
    "syntax-type": { $type: "color", $value: "{warning-700}" },
    "syntax-parameter": { $type: "color", $value: "{primary-500}" },
    "syntax-variable": { $type: "color", $value: "{secondary-500}" },
    "syntax-error": { $type: "color", $value: "{error-600}" },
    "syntax-regex": { $type: "color", $value: "{error-500}" },
    "syntax-regex-constant": { $type: "color", $value: "{warning-600}" },
    "syntax-tag": { $type: "color", $value: "{primary-700}" },
    "syntax-punctuation": { $type: "color", $value: "{neutral-400}" },
    "syntax-operator": { $type: "color", $value: "{tertiary-500}" },
    "syntax-label": { $type: "color", $value: "{neutral-600}" },
    "syntax-header": { $type: "color", $value: "{primary-700}" },
    "syntax-list-marker": { $type: "color", $value: "{secondary-600}" },
    "syntax-builtin": { $type: "color", $value: "{tertiary-600}" },
    "syntax-property": { $type: "color", $value: "{secondary-700}" },
    "syntax-placeholder": { $type: "color", $value: "{neutral-400}" },
  },
  modifiers: {
    color: {
      dark: {
        "syntax-text": "{neutral-100}",
        "syntax-comment": "{neutral-400}",
        "syntax-keyword": "{primary-400}",
        "syntax-number": "{tertiary-300}",
        "syntax-string": "{success-400}",
        "syntax-function": "{secondary-400}",
        "syntax-type": "{warning-300}",
        "syntax-parameter": "{primary-300}",
        "syntax-variable": "{secondary-300}",
        "syntax-error": "{error-400}",
        "syntax-regex": "{error-300}",
        "syntax-regex-constant": "{warning-400}",
        "syntax-tag": "{primary-300}",
        "syntax-punctuation": "{neutral-500}",
        "syntax-operator": "{tertiary-400}",
        "syntax-label": "{neutral-300}",
        "syntax-header": "{primary-300}",
        "syntax-list-marker": "{secondary-400}",
        "syntax-builtin": "{tertiary-400}",
        "syntax-property": "{secondary-300}",
        "syntax-placeholder": "{neutral-500}",
      },
    },
  },
  order: [],
});
