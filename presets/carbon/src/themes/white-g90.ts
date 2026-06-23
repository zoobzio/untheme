import preset from "../preset";

/**
 * White / Gray 90 — Carbon's White light theme paired with the Gray 90 dark
 * theme. Light mode inherits the base (White); only the dark mode is remapped
 * onto Gray 90, whose layers and supporting colors sit one grade lighter than
 * Gray 100.
 */
export default preset.define({
  id: "white-g90",
  name: "White / Gray 90",
  reference: {},
  system: {
    // Light mode inherits the base (White)
    light: {},
    dark: {
      background: "gray-90",
      "background-inverse": "gray-10",
      "layer-01": "gray-80",
      "layer-02": "gray-70",
      "layer-03": "gray-60",
      "field-01": "gray-80",
      "field-02": "gray-70",
      "text-primary": "gray-10",
      "text-secondary": "gray-30",
      "text-on-color": "white",
      "text-helper": "gray-30",
      "text-error": "red-30",
      "text-inverse": "gray-100",
      "link-primary": "blue-40",
      "link-secondary": "blue-30",
      "link-visited": "purple-40",
      "border-subtle-00": "gray-70",
      "border-subtle-01": "gray-60",
      "border-strong-01": "gray-50",
      "border-inverse": "gray-10",
      "border-interactive": "blue-50",
      "icon-primary": "gray-10",
      "icon-secondary": "gray-30",
      "icon-on-color": "white",
      "icon-inverse": "gray-100",
      "support-error": "red-40",
      "support-success": "green-40",
      "support-warning": "yellow-30",
      "support-info": "blue-50",
      focus: "white",
      interactive: "blue-50",
    },
  },
  roles: {},
});
