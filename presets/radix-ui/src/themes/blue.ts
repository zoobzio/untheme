import preset from "../preset";

/**
 * Blue theme — Radix blue accent paired with the slate gray.
 */
export default preset.define({
  id: "blue",
  name: "Blue",
  reference: {},
  system: {
    light: {
      "accent-app-bg": "blue-1",
      "accent-subtle-bg": "blue-2",
      "accent-element": "blue-3",
      "accent-element-hover": "blue-4",
      "accent-element-active": "blue-5",
      "accent-border-subtle": "blue-6",
      "accent-border": "blue-7",
      "accent-border-strong": "blue-8",
      "accent-solid": "blue-9",
      "accent-solid-hover": "blue-10",
      "accent-text-subtle": "blue-11",
      "accent-text": "blue-12",
    },
    dark: {
      "accent-app-bg": "blue-dark-1",
      "accent-subtle-bg": "blue-dark-2",
      "accent-element": "blue-dark-3",
      "accent-element-hover": "blue-dark-4",
      "accent-element-active": "blue-dark-5",
      "accent-border-subtle": "blue-dark-6",
      "accent-border": "blue-dark-7",
      "accent-border-strong": "blue-dark-8",
      "accent-solid": "blue-dark-9",
      "accent-solid-hover": "blue-dark-10",
      "accent-text-subtle": "blue-dark-11",
      "accent-text": "blue-dark-12",
    },
  },
  roles: {},
});
