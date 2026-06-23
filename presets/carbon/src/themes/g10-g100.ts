import preset from "../preset";

/**
 * Gray 10 / Gray 100 — Carbon's Gray 10 light theme paired with the base Gray
 * 100 dark theme. Dark mode inherits the base (Gray 100); only the light mode
 * is
 * remapped onto Gray 10, whose layered surfaces alternate white/gray-10 from a
 * gray-10 background.
 */
export default preset.define({
  id: "g10-g100",
  name: "Gray 10 / Gray 100",
  reference: {},
  system: {
    light: {
      background: "gray-10",
      "background-inverse": "gray-80",
      "layer-01": "white",
      "layer-02": "gray-10",
      "layer-03": "white",
      "field-01": "white",
      "field-02": "gray-10",
      "text-primary": "gray-100",
      "text-secondary": "gray-70",
      "text-on-color": "white",
      "text-helper": "gray-60",
      "text-error": "red-60",
      "text-inverse": "white",
      "link-primary": "blue-60",
      "link-secondary": "blue-70",
      "link-visited": "purple-60",
      "border-subtle-00": "gray-30",
      "border-subtle-01": "gray-20",
      "border-strong-01": "gray-50",
      "border-inverse": "gray-100",
      "border-interactive": "blue-60",
      "icon-primary": "gray-100",
      "icon-secondary": "gray-70",
      "icon-on-color": "white",
      "icon-inverse": "white",
      "support-error": "red-60",
      "support-success": "green-50",
      "support-warning": "yellow-30",
      "support-info": "blue-70",
      focus: "blue-60",
      interactive: "blue-60",
    },
    // Dark mode inherits the base (Gray 100)
    dark: {},
  },
  roles: {},
});
