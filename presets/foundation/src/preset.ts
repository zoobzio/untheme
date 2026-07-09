import { defineUnthemePreset } from "@untheme/kit";

/**
 * The Foundation preset.
 *
 * The reference untheme preset: Material 3 semantics carried by eight
 * functional tonal ramps — primary, secondary, tertiary, error, success,
 * warning, neutral, and neutral-variant — plus the M3 type scale, shape
 * radii, elevation shadows, motion easings and durations, state-layer
 * opacities, and a spacing scale of its own (M3 defines none). Every role
 * binds a ramp step by reference, and the role-to-tone mapping is fixed by
 * the M3 spec, so a theme variant rebinds only the ramp values and every
 * role and context follows.
 *
 * Six modifier axes compose in `order`: `color` (light/dark) rebinds the
 * color roles; `contrast` (default/medium/high) re-points roles at the
 * `*-medium-contrast` / `*-high-contrast` channel tokens; `text`
 * (sm/md/lg) scales the type roles; `density` (compact/default/spacious)
 * scales spacing and control metrics; `radius` (sharp/default/round)
 * rebinds the shape radii; `motion` (default/reduced) zeroes the
 * durations. The axes override disjoint token sets — except `color` and
 * `contrast`, which deliberately collide on the color roles: what "higher
 * contrast" means depends on the mode, so each color context also sets the
 * channel tokens for its mode, and the contrast contexts override roles with
 * mode-independent references whose targets the color axis already resolved.
 * `contrast` follows `color` in `order`, so its override wins the
 * collision.
 */
export const preset = defineUnthemePreset({
  id: "foundation",
  name: "Foundation",
  tokens: {
    // Tonal ramps — eight functional palettes at the 26 M3 tone stops
    "primary-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0] },
    },
    "primary-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.07451, 0, 0.22745],
        hex: "#13003a",
      },
    },
    "primary-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.09804, 0, 0.28235],
        hex: "#190048",
      },
    },
    "primary-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.13333, 0, 0.36471],
        hex: "#22005d",
      },
    },
    "primary-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.14902, 0.01961, 0.38039],
        hex: "#260561",
      },
    },
    "primary-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.19216, 0.08627, 0.42353],
        hex: "#31166c",
      },
    },
    "primary-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.21961, 0.11765, 0.44706],
        hex: "#381e72",
      },
    },
    "primary-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23529, 0.13725, 0.46667],
        hex: "#3c2377",
      },
    },
    "primary-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.2549, 0.15686, 0.48627],
        hex: "#41287c",
      },
    },
    "primary-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.26275, 0.16863, 0.49412],
        hex: "#432b7e",
      },
    },
    "primary-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.3098, 0.21569, 0.54118],
        hex: "#4f378a",
      },
    },
    "primary-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.35686, 0.26275, 0.59216],
        hex: "#5b4397",
      },
    },
    "primary-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.40392, 0.31373, 0.64314],
        hex: "#6750a4",
      },
    },
    "primary-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.50196, 0.41176, 0.74902],
        hex: "#8069bf",
      },
    },
    "primary-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.60392, 0.51373, 0.85882],
        hex: "#9a83db",
      },
    },
    "primary-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.71373, 0.61569, 0.97255],
        hex: "#b69df8",
      },
    },
    "primary-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.81176, 0.73725, 1],
        hex: "#cfbcff",
      },
    },
    "primary-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.88235, 0.82745, 1],
        hex: "#e1d3ff",
      },
    },
    "primary-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.91373, 0.86667, 1],
        hex: "#e9ddff",
      },
    },
    "primary-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.93333, 0.89412, 1],
        hex: "#eee4ff",
      },
    },
    "primary-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.95294, 0.91765, 1],
        hex: "#f3eaff",
      },
    },
    "primary-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.96471, 0.93333, 1],
        hex: "#f6eeff",
      },
    },
    "primary-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.97255, 0.9451, 1],
        hex: "#f8f1ff",
      },
    },
    "primary-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.99216, 0.96863, 1],
        hex: "#fdf7ff",
      },
    },
    "primary-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "primary-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "secondary-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "secondary-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.06275, 0.04314, 0.11373],
        hex: "#100b1d",
      },
    },
    "secondary-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.08235, 0.06275, 0.13333],
        hex: "#151022",
      },
    },
    "secondary-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.11765, 0.09804, 0.16863],
        hex: "#1e192b",
      },
    },
    "secondary-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.13333, 0.11373, 0.18431],
        hex: "#221d2f",
      },
    },
    "secondary-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.17255, 0.15294, 0.22745],
        hex: "#2c273a",
      },
    },
    "secondary-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.2, 0.17647, 0.2549],
        hex: "#332d41",
      },
    },
    "secondary-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.21569, 0.19608, 0.27059],
        hex: "#373245",
      },
    },
    "secondary-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23529, 0.21176, 0.2902],
        hex: "#3c364a",
      },
    },
    "secondary-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.24314, 0.21961, 0.29804],
        hex: "#3e384c",
      },
    },
    "secondary-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.2902, 0.26667, 0.3451],
        hex: "#4a4458",
      },
    },
    "secondary-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.33725, 0.3098, 0.39216],
        hex: "#564f64",
      },
    },
    "secondary-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.38431, 0.35686, 0.44314],
        hex: "#625b71",
      },
    },
    "secondary-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.48235, 0.4549, 0.54118],
        hex: "#7b748a",
      },
    },
    "secondary-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.58431, 0.55294, 0.64314],
        hex: "#958da4",
      },
    },
    "secondary-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.6902, 0.6549, 0.75294],
        hex: "#b0a7c0",
      },
    },
    "secondary-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.79608, 0.76078, 0.85882],
        hex: "#cbc2db",
      },
    },
    "secondary-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.87451, 0.83922, 0.93725],
        hex: "#dfd6ef",
      },
    },
    "secondary-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.9098, 0.87059, 0.97255],
        hex: "#e8def8",
      },
    },
    "secondary-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.93333, 0.89412, 0.99608],
        hex: "#eee4fe",
      },
    },
    "secondary-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.95294, 0.91765, 1],
        hex: "#f3eaff",
      },
    },
    "secondary-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.96471, 0.93333, 1],
        hex: "#f6eeff",
      },
    },
    "secondary-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.97255, 0.9451, 1],
        hex: "#f8f1ff",
      },
    },
    "secondary-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.99216, 0.96863, 1],
        hex: "#fdf7ff",
      },
    },
    "secondary-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "secondary-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "tertiary-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "tertiary-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.12941, 0.01569, 0.06275],
        hex: "#210410",
      },
    },
    "tertiary-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.15294, 0.03137, 0.08235],
        hex: "#270815",
      },
    },
    "tertiary-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.19216, 0.06275, 0.11373],
        hex: "#31101d",
      },
    },
    "tertiary-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.21176, 0.07843, 0.12941],
        hex: "#361421",
      },
    },
    "tertiary-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.25882, 0.12157, 0.17255],
        hex: "#421f2c",
      },
    },
    "tertiary-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.2902, 0.1451, 0.19608],
        hex: "#4a2532",
      },
    },
    "tertiary-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.3098, 0.16078, 0.21176],
        hex: "#4f2936",
      },
    },
    "tertiary-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.32941, 0.18039, 0.23137],
        hex: "#542e3b",
      },
    },
    "tertiary-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.33725, 0.18824, 0.23922],
        hex: "#56303d",
      },
    },
    "tertiary-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.38824, 0.23137, 0.28235],
        hex: "#633b48",
      },
    },
    "tertiary-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.43922, 0.27451, 0.32941],
        hex: "#704654",
      },
    },
    "tertiary-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.49412, 0.32157, 0.37647],
        hex: "#7e5260",
      },
    },
    "tertiary-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.6, 0.41569, 0.47451],
        hex: "#996a79",
      },
    },
    "tertiary-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.7098, 0.51373, 0.57255],
        hex: "#b58392",
      },
    },
    "tertiary-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.82353, 0.61569, 0.67843],
        hex: "#d29dad",
      },
    },
    "tertiary-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.93725, 0.72157, 0.78431],
        hex: "#efb8c8",
      },
    },
    "tertiary-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.80392, 0.85882],
        hex: "#ffcddb",
      },
    },
    "tertiary-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.85098, 0.8902],
        hex: "#ffd9e3",
      },
    },
    "tertiary-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.88235, 0.9098],
        hex: "#ffe1e8",
      },
    },
    "tertiary-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.9098, 0.92941],
        hex: "#ffe8ed",
      },
    },
    "tertiary-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.92549, 0.94118],
        hex: "#ffecf0",
      },
    },
    "tertiary-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.94118, 0.94902],
        hex: "#fff0f2",
      },
    },
    "tertiary-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.97255, 0.97255],
        hex: "#fff8f8",
      },
    },
    "tertiary-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "tertiary-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "error-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "error-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.15686, 0, 0.00392],
        hex: "#280001",
      },
    },
    "error-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.19216, 0, 0.00392],
        hex: "#310001",
      },
    },
    "error-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.2549, 0, 0.00784],
        hex: "#410002",
      },
    },
    "error-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.28627, 0, 0.00784],
        hex: "#490002",
      },
    },
    "error-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.36078, 0, 0.01569],
        hex: "#5c0004",
      },
    },
    "error-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.41176, 0, 0.01961],
        hex: "#690005",
      },
    },
    "error-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.44314, 0, 0.01961],
        hex: "#710005",
      },
    },
    "error-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.47451, 0, 0.02353],
        hex: "#790006",
      },
    },
    "error-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.49412, 0, 0.02745],
        hex: "#7e0007",
      },
    },
    "error-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.57647, 0, 0.03922],
        hex: "#93000a",
      },
    },
    "error-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.65882, 0.02745, 0.06275],
        hex: "#a80710",
      },
    },
    "error-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.72941, 0.10196, 0.10196],
        hex: "#ba1a1a",
      },
    },
    "error-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.87059, 0.21569, 0.18824],
        hex: "#de3730",
      },
    },
    "error-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.32941, 0.28627],
        hex: "#ff5449",
      },
    },
    "error-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.53725, 0.4902],
        hex: "#ff897d",
      },
    },
    "error-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.70588, 0.67059],
        hex: "#ffb4ab",
      },
    },
    "error-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.81176, 0.78824],
        hex: "#ffcfc9",
      },
    },
    "error-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.8549, 0.83922],
        hex: "#ffdad6",
      },
    },
    "error-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.88627, 0.87059],
        hex: "#ffe2de",
      },
    },
    "error-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.91373, 0.90196],
        hex: "#ffe9e6",
      },
    },
    "error-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.92941, 0.91765],
        hex: "#ffedea",
      },
    },
    "error-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.94118, 0.93333],
        hex: "#fff0ee",
      },
    },
    "error-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.97255, 0.96863],
        hex: "#fff8f7",
      },
    },
    "error-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "error-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "success-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "success-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.07059, 0.00392],
        hex: "#001201",
      },
    },
    "success-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.09412, 0.00784],
        hex: "#001802",
      },
    },
    "success-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.13333, 0.01569],
        hex: "#002204",
      },
    },
    "success-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.14902, 0.01569],
        hex: "#002604",
      },
    },
    "success-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.19608, 0.02745],
        hex: "#003207",
      },
    },
    "success-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.22353, 0.03529],
        hex: "#003909",
      },
    },
    "success-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.24314, 0.04314],
        hex: "#003e0b",
      },
    },
    "success-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.26275, 0.05098],
        hex: "#00430d",
      },
    },
    "success-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.27451, 0.0549],
        hex: "#00460e",
      },
    },
    "success-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0, 0.32549, 0.07059],
        hex: "#005312",
      },
    },
    "success-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.02745, 0.37647, 0.09804],
        hex: "#076019",
      },
    },
    "success-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.10588, 0.42745, 0.14118],
        hex: "#1b6d24",
      },
    },
    "success-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.21961, 0.52941, 0.22745],
        hex: "#38873a",
      },
    },
    "success-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.32549, 0.63529, 0.32157],
        hex: "#53a252",
      },
    },
    "success-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.42745, 0.74118, 0.41569],
        hex: "#6dbd6a",
      },
    },
    "success-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.53333, 0.85098, 0.5098],
        hex: "#88d982",
      },
    },
    "success-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.60784, 0.93333, 0.58039],
        hex: "#9bee94",
      },
    },
    "success-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.63922, 0.96471, 0.61176],
        hex: "#a3f69c",
      },
    },
    "success-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.65882, 0.98824, 0.63137],
        hex: "#a8fca1",
      },
    },
    "success-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.73333, 1, 0.69804],
        hex: "#bbffb2",
      },
    },
    "success-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.78431, 1, 0.74902],
        hex: "#c8ffbf",
      },
    },
    "success-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.83529, 1, 0.8],
        hex: "#d5ffcc",
      },
    },
    "success-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.92549, 1, 0.89412],
        hex: "#ecffe4",
      },
    },
    "success-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.96471, 1, 0.94118],
        hex: "#f6fff0",
      },
    },
    "success-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "warning-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "warning-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.09412, 0.04706, 0],
        hex: "#180c00",
      },
    },
    "warning-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.12157, 0.06275, 0],
        hex: "#1f1000",
      },
    },
    "warning-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.16471, 0.09412, 0],
        hex: "#2a1800",
      },
    },
    "warning-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.18431, 0.10588, 0],
        hex: "#2f1b00",
      },
    },
    "warning-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23922, 0.1451, 0],
        hex: "#3d2500",
      },
    },
    "warning-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.27451, 0.16863, 0],
        hex: "#462b00",
      },
    },
    "warning-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.29412, 0.18431, 0],
        hex: "#4b2f00",
      },
    },
    "warning-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.31765, 0.2, 0],
        hex: "#513300",
      },
    },
    "warning-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.32941, 0.20784, 0],
        hex: "#543500",
      },
    },
    "warning-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.39216, 0.24706, 0],
        hex: "#643f00",
      },
    },
    "warning-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.45098, 0.2902, 0],
        hex: "#734a00",
      },
    },
    "warning-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.51373, 0.32941, 0],
        hex: "#835400",
      },
    },
    "warning-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.64706, 0.41961, 0],
        hex: "#a56b00",
      },
    },
    "warning-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.78039, 0.5098, 0],
        hex: "#c78200",
      },
    },
    "warning-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.91373, 0.60784, 0.07451],
        hex: "#e99b13",
      },
    },
    "warning-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.72549, 0.34118],
        hex: "#ffb957",
      },
    },
    "warning-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.82745, 0.61176],
        hex: "#ffd39c",
      },
    },
    "warning-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.86667, 0.7098],
        hex: "#ffddb5",
      },
    },
    "warning-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.89412, 0.77255],
        hex: "#ffe4c5",
      },
    },
    "warning-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.92157, 0.83529],
        hex: "#ffebd5",
      },
    },
    "warning-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.93333, 0.86667],
        hex: "#ffeedd",
      },
    },
    "warning-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.9451, 0.89804],
        hex: "#fff1e5",
      },
    },
    "warning-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.97255, 0.95686],
        hex: "#fff8f4",
      },
    },
    "warning-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "warning-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "neutral-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "neutral-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.05882, 0.0549, 0.06667],
        hex: "#0f0e11",
      },
    },
    "neutral-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.07843, 0.07451, 0.08627],
        hex: "#141316",
      },
    },
    "neutral-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.1098, 0.10588, 0.11765],
        hex: "#1c1b1e",
      },
    },
    "neutral-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.12549, 0.12157, 0.13333],
        hex: "#201f22",
      },
    },
    "neutral-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.16863, 0.16078, 0.17647],
        hex: "#2b292d",
      },
    },
    "neutral-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.19216, 0.18824, 0.2],
        hex: "#313033",
      },
    },
    "neutral-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.21176, 0.20392, 0.21961],
        hex: "#363438",
      },
    },
    "neutral-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.22745, 0.21961, 0.23529],
        hex: "#3a383c",
      },
    },
    "neutral-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23922, 0.23137, 0.24314],
        hex: "#3d3b3e",
      },
    },
    "neutral-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.28235, 0.27451, 0.2902],
        hex: "#48464a",
      },
    },
    "neutral-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.32941, 0.31765, 0.33725],
        hex: "#545156",
      },
    },
    "neutral-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.37647, 0.36471, 0.38431],
        hex: "#605d62",
      },
    },
    "neutral-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.47451, 0.46275, 0.47843],
        hex: "#79767a",
      },
    },
    "neutral-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.57647, 0.56078, 0.58039],
        hex: "#938f94",
      },
    },
    "neutral-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.68235, 0.66667, 0.68235],
        hex: "#aeaaae",
      },
    },
    "neutral-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.79216, 0.77255, 0.79216],
        hex: "#cac5ca",
      },
    },
    "neutral-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.86667, 0.84706, 0.86667],
        hex: "#ddd8dd",
      },
    },
    "neutral-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.90196, 0.88235, 0.90196],
        hex: "#e6e1e6",
      },
    },
    "neutral-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.92549, 0.90588, 0.92157],
        hex: "#ece7eb",
      },
    },
    "neutral-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.94902, 0.92549, 0.9451],
        hex: "#f2ecf1",
      },
    },
    "neutral-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.95686, 0.93725, 0.95686],
        hex: "#f4eff4",
      },
    },
    "neutral-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.96863, 0.94902, 0.96863],
        hex: "#f7f2f7",
      },
    },
    "neutral-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.99216, 0.97255, 0.99216],
        hex: "#fdf8fd",
      },
    },
    "neutral-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "neutral-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    "neutral-variant-0": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    "neutral-variant-4": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.05882, 0.05098, 0.07843],
        hex: "#0f0d14",
      },
    },
    "neutral-variant-6": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.07843, 0.07059, 0.10196],
        hex: "#14121a",
      },
    },
    "neutral-variant-10": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.11373, 0.10196, 0.13333],
        hex: "#1d1a22",
      },
    },
    "neutral-variant-12": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.12941, 0.11765, 0.14902],
        hex: "#211e26",
      },
    },
    "neutral-variant-17": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.16863, 0.16078, 0.19216],
        hex: "#2b2931",
      },
    },
    "neutral-variant-20": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.19608, 0.18431, 0.21961],
        hex: "#322f38",
      },
    },
    "neutral-variant-22": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.21176, 0.2, 0.23529],
        hex: "#36333c",
      },
    },
    "neutral-variant-24": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23137, 0.21961, 0.25098],
        hex: "#3b3840",
      },
    },
    "neutral-variant-25": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23922, 0.22745, 0.26275],
        hex: "#3d3a43",
      },
    },
    "neutral-variant-30": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.28627, 0.27059, 0.30588],
        hex: "#49454e",
      },
    },
    "neutral-variant-35": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.32941, 0.31765, 0.35294],
        hex: "#54515a",
      },
    },
    "neutral-variant-40": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.38039, 0.36471, 0.4],
        hex: "#615d66",
      },
    },
    "neutral-variant-50": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.47843, 0.45882, 0.49804],
        hex: "#7a757f",
      },
    },
    "neutral-variant-60": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.58039, 0.56078, 0.6],
        hex: "#948f99",
      },
    },
    "neutral-variant-70": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.68627, 0.66275, 0.70588],
        hex: "#afa9b4",
      },
    },
    "neutral-variant-80": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.79216, 0.76863, 0.81176],
        hex: "#cac4cf",
      },
    },
    "neutral-variant-87": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.87059, 0.84706, 0.8902],
        hex: "#ded8e3",
      },
    },
    "neutral-variant-90": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.90588, 0.87843, 0.92157],
        hex: "#e7e0eb",
      },
    },
    "neutral-variant-92": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.92549, 0.90196, 0.9451],
        hex: "#ece6f1",
      },
    },
    "neutral-variant-94": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.94902, 0.92157, 0.96863],
        hex: "#f2ebf7",
      },
    },
    "neutral-variant-95": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.96078, 0.93333, 0.98039],
        hex: "#f5eefa",
      },
    },
    "neutral-variant-96": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.97255, 0.9451, 0.99216],
        hex: "#f8f1fd",
      },
    },
    "neutral-variant-98": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.99216, 0.96863, 1],
        hex: "#fdf7ff",
      },
    },
    "neutral-variant-99": {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0.98431, 1],
        hex: "#fffbff",
      },
    },
    "neutral-variant-100": {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    // Typography — typefaces and weights
    "font-brand": { $type: "fontFamily", $value: ["Roboto", "sans-serif"] },
    "font-plain": { $type: "fontFamily", $value: ["Roboto", "sans-serif"] },
    "weight-regular": { $type: "fontWeight", $value: 400 },
    "weight-medium": { $type: "fontWeight", $value: 500 },
    "weight-bold": { $type: "fontWeight", $value: 700 },
    // Typography — the M3 type scale, per-property so the text axis can
    // rebind sizes and line heights independently
    "display-large-font": { $type: "fontFamily", $value: "{font-brand}" },
    "display-large-size": {
      $type: "dimension",
      $value: { value: 57, unit: "px" },
    },
    "display-large-line-height": {
      $type: "dimension",
      $value: { value: 64, unit: "px" },
    },
    "display-large-weight": { $type: "fontWeight", $value: "{weight-regular}" },
    "display-large-tracking": {
      $type: "dimension",
      $value: { value: -0.25, unit: "px" },
    },
    "display-medium-font": { $type: "fontFamily", $value: "{font-brand}" },
    "display-medium-size": {
      $type: "dimension",
      $value: { value: 45, unit: "px" },
    },
    "display-medium-line-height": {
      $type: "dimension",
      $value: { value: 52, unit: "px" },
    },
    "display-medium-weight": {
      $type: "fontWeight",
      $value: "{weight-regular}",
    },
    "display-medium-tracking": {
      $type: "dimension",
      $value: { value: 0, unit: "px" },
    },
    "display-small-font": { $type: "fontFamily", $value: "{font-brand}" },
    "display-small-size": {
      $type: "dimension",
      $value: { value: 36, unit: "px" },
    },
    "display-small-line-height": {
      $type: "dimension",
      $value: { value: 44, unit: "px" },
    },
    "display-small-weight": { $type: "fontWeight", $value: "{weight-regular}" },
    "display-small-tracking": {
      $type: "dimension",
      $value: { value: 0, unit: "px" },
    },
    "headline-large-font": { $type: "fontFamily", $value: "{font-brand}" },
    "headline-large-size": {
      $type: "dimension",
      $value: { value: 32, unit: "px" },
    },
    "headline-large-line-height": {
      $type: "dimension",
      $value: { value: 40, unit: "px" },
    },
    "headline-large-weight": {
      $type: "fontWeight",
      $value: "{weight-regular}",
    },
    "headline-large-tracking": {
      $type: "dimension",
      $value: { value: 0, unit: "px" },
    },
    "headline-medium-font": { $type: "fontFamily", $value: "{font-brand}" },
    "headline-medium-size": {
      $type: "dimension",
      $value: { value: 28, unit: "px" },
    },
    "headline-medium-line-height": {
      $type: "dimension",
      $value: { value: 36, unit: "px" },
    },
    "headline-medium-weight": {
      $type: "fontWeight",
      $value: "{weight-regular}",
    },
    "headline-medium-tracking": {
      $type: "dimension",
      $value: { value: 0, unit: "px" },
    },
    "headline-small-font": { $type: "fontFamily", $value: "{font-brand}" },
    "headline-small-size": {
      $type: "dimension",
      $value: { value: 24, unit: "px" },
    },
    "headline-small-line-height": {
      $type: "dimension",
      $value: { value: 32, unit: "px" },
    },
    "headline-small-weight": {
      $type: "fontWeight",
      $value: "{weight-regular}",
    },
    "headline-small-tracking": {
      $type: "dimension",
      $value: { value: 0, unit: "px" },
    },
    "title-large-font": { $type: "fontFamily", $value: "{font-brand}" },
    "title-large-size": {
      $type: "dimension",
      $value: { value: 22, unit: "px" },
    },
    "title-large-line-height": {
      $type: "dimension",
      $value: { value: 28, unit: "px" },
    },
    "title-large-weight": { $type: "fontWeight", $value: "{weight-regular}" },
    "title-large-tracking": {
      $type: "dimension",
      $value: { value: 0, unit: "px" },
    },
    "title-medium-font": { $type: "fontFamily", $value: "{font-plain}" },
    "title-medium-size": {
      $type: "dimension",
      $value: { value: 16, unit: "px" },
    },
    "title-medium-line-height": {
      $type: "dimension",
      $value: { value: 24, unit: "px" },
    },
    "title-medium-weight": { $type: "fontWeight", $value: "{weight-medium}" },
    "title-medium-tracking": {
      $type: "dimension",
      $value: { value: 0.15, unit: "px" },
    },
    "title-small-font": { $type: "fontFamily", $value: "{font-plain}" },
    "title-small-size": {
      $type: "dimension",
      $value: { value: 14, unit: "px" },
    },
    "title-small-line-height": {
      $type: "dimension",
      $value: { value: 20, unit: "px" },
    },
    "title-small-weight": { $type: "fontWeight", $value: "{weight-medium}" },
    "title-small-tracking": {
      $type: "dimension",
      $value: { value: 0.1, unit: "px" },
    },
    "body-large-font": { $type: "fontFamily", $value: "{font-plain}" },
    "body-large-size": {
      $type: "dimension",
      $value: { value: 16, unit: "px" },
    },
    "body-large-line-height": {
      $type: "dimension",
      $value: { value: 24, unit: "px" },
    },
    "body-large-weight": { $type: "fontWeight", $value: "{weight-regular}" },
    "body-large-tracking": {
      $type: "dimension",
      $value: { value: 0.5, unit: "px" },
    },
    "body-medium-font": { $type: "fontFamily", $value: "{font-plain}" },
    "body-medium-size": {
      $type: "dimension",
      $value: { value: 14, unit: "px" },
    },
    "body-medium-line-height": {
      $type: "dimension",
      $value: { value: 20, unit: "px" },
    },
    "body-medium-weight": { $type: "fontWeight", $value: "{weight-regular}" },
    "body-medium-tracking": {
      $type: "dimension",
      $value: { value: 0.25, unit: "px" },
    },
    "body-small-font": { $type: "fontFamily", $value: "{font-plain}" },
    "body-small-size": {
      $type: "dimension",
      $value: { value: 12, unit: "px" },
    },
    "body-small-line-height": {
      $type: "dimension",
      $value: { value: 16, unit: "px" },
    },
    "body-small-weight": { $type: "fontWeight", $value: "{weight-regular}" },
    "body-small-tracking": {
      $type: "dimension",
      $value: { value: 0.4, unit: "px" },
    },
    "label-large-font": { $type: "fontFamily", $value: "{font-plain}" },
    "label-large-size": {
      $type: "dimension",
      $value: { value: 14, unit: "px" },
    },
    "label-large-line-height": {
      $type: "dimension",
      $value: { value: 20, unit: "px" },
    },
    "label-large-weight": { $type: "fontWeight", $value: "{weight-medium}" },
    "label-large-weight-prominent": {
      $type: "fontWeight",
      $value: "{weight-bold}",
    },
    "label-large-tracking": {
      $type: "dimension",
      $value: { value: 0.1, unit: "px" },
    },
    "label-medium-font": { $type: "fontFamily", $value: "{font-plain}" },
    "label-medium-size": {
      $type: "dimension",
      $value: { value: 12, unit: "px" },
    },
    "label-medium-line-height": {
      $type: "dimension",
      $value: { value: 16, unit: "px" },
    },
    "label-medium-weight": { $type: "fontWeight", $value: "{weight-medium}" },
    "label-medium-weight-prominent": {
      $type: "fontWeight",
      $value: "{weight-bold}",
    },
    "label-medium-tracking": {
      $type: "dimension",
      $value: { value: 0.5, unit: "px" },
    },
    "label-small-font": { $type: "fontFamily", $value: "{font-plain}" },
    "label-small-size": {
      $type: "dimension",
      $value: { value: 11, unit: "px" },
    },
    "label-small-line-height": {
      $type: "dimension",
      $value: { value: 16, unit: "px" },
    },
    "label-small-weight": { $type: "fontWeight", $value: "{weight-medium}" },
    "label-small-weight-prominent": {
      $type: "fontWeight",
      $value: "{weight-bold}",
    },
    "label-small-tracking": {
      $type: "dimension",
      $value: { value: 0.5, unit: "px" },
    },
    // Shape radii
    "shape-none": { $type: "dimension", $value: { value: 0, unit: "px" } },
    "shape-extra-small": {
      $type: "dimension",
      $value: { value: 4, unit: "px" },
    },
    "shape-small": { $type: "dimension", $value: { value: 8, unit: "px" } },
    "shape-medium": { $type: "dimension", $value: { value: 12, unit: "px" } },
    "shape-large": { $type: "dimension", $value: { value: 16, unit: "px" } },
    "shape-large-increased": {
      $type: "dimension",
      $value: { value: 20, unit: "px" },
    },
    "shape-extra-large": {
      $type: "dimension",
      $value: { value: 28, unit: "px" },
    },
    "shape-extra-large-increased": {
      $type: "dimension",
      $value: { value: 32, unit: "px" },
    },
    "shape-extra-extra-large": {
      $type: "dimension",
      $value: { value: 48, unit: "px" },
    },
    "shape-full": { $type: "dimension", $value: { value: 9999, unit: "px" } },
    // Spacing scale and control metrics
    "space-none": { $type: "dimension", $value: { value: 0, unit: "px" } },
    "space-extra-small": {
      $type: "dimension",
      $value: { value: 4, unit: "px" },
    },
    "space-small": { $type: "dimension", $value: { value: 8, unit: "px" } },
    "space-medium": { $type: "dimension", $value: { value: 16, unit: "px" } },
    "space-large": { $type: "dimension", $value: { value: 24, unit: "px" } },
    "space-extra-large": {
      $type: "dimension",
      $value: { value: 32, unit: "px" },
    },
    "space-extra-extra-large": {
      $type: "dimension",
      $value: { value: 48, unit: "px" },
    },
    "control-height-small": {
      $type: "dimension",
      $value: { value: 32, unit: "px" },
    },
    "control-height-medium": {
      $type: "dimension",
      $value: { value: 40, unit: "px" },
    },
    "control-height-large": {
      $type: "dimension",
      $value: { value: 56, unit: "px" },
    },
    "control-gap": { $type: "dimension", $value: { value: 8, unit: "px" } },
    "control-padding": {
      $type: "dimension",
      $value: { value: 16, unit: "px" },
    },
    // Elevation
    "elevation-0": {
      $type: "shadow",
      $value: {
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 0, unit: "px" },
        blur: { value: 0, unit: "px" },
        spread: { value: 0, unit: "px" },
      },
    },
    "elevation-1": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.3 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 1, unit: "px" },
          blur: { value: 2, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 1, unit: "px" },
          blur: { value: 3, unit: "px" },
          spread: { value: 1, unit: "px" },
        },
      ],
    },
    "elevation-2": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.3 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 1, unit: "px" },
          blur: { value: 2, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 2, unit: "px" },
          blur: { value: 6, unit: "px" },
          spread: { value: 2, unit: "px" },
        },
      ],
    },
    "elevation-3": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.3 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 1, unit: "px" },
          blur: { value: 3, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 4, unit: "px" },
          blur: { value: 8, unit: "px" },
          spread: { value: 3, unit: "px" },
        },
      ],
    },
    "elevation-4": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.3 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 2, unit: "px" },
          blur: { value: 3, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 6, unit: "px" },
          blur: { value: 10, unit: "px" },
          spread: { value: 4, unit: "px" },
        },
      ],
    },
    "elevation-5": {
      $type: "shadow",
      $value: [
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.3 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 4, unit: "px" },
          blur: { value: 4, unit: "px" },
          spread: { value: 0, unit: "px" },
        },
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 8, unit: "px" },
          blur: { value: 12, unit: "px" },
          spread: { value: 6, unit: "px" },
        },
      ],
    },
    // Motion — easing
    "easing-standard": { $type: "cubicBezier", $value: [0.2, 0, 0, 1] },
    "easing-standard-decelerate": {
      $type: "cubicBezier",
      $value: [0, 0, 0, 1],
    },
    "easing-standard-accelerate": {
      $type: "cubicBezier",
      $value: [0.3, 0, 1, 1],
    },
    "easing-emphasized": { $type: "cubicBezier", $value: [0.2, 0, 0, 1] },
    "easing-emphasized-decelerate": {
      $type: "cubicBezier",
      $value: [0.05, 0.7, 0.1, 1],
    },
    "easing-emphasized-accelerate": {
      $type: "cubicBezier",
      $value: [0.3, 0, 0.8, 0.15],
    },
    "easing-linear": { $type: "cubicBezier", $value: [0, 0, 1, 1] },
    "easing-legacy": { $type: "cubicBezier", $value: [0.4, 0, 0.2, 1] },
    "easing-legacy-decelerate": {
      $type: "cubicBezier",
      $value: [0, 0, 0.2, 1],
    },
    "easing-legacy-accelerate": {
      $type: "cubicBezier",
      $value: [0.4, 0, 1, 1],
    },
    // Motion — duration
    "duration-short-1": {
      $type: "duration",
      $value: { value: 50, unit: "ms" },
    },
    "duration-short-2": {
      $type: "duration",
      $value: { value: 100, unit: "ms" },
    },
    "duration-short-3": {
      $type: "duration",
      $value: { value: 150, unit: "ms" },
    },
    "duration-short-4": {
      $type: "duration",
      $value: { value: 200, unit: "ms" },
    },
    "duration-medium-1": {
      $type: "duration",
      $value: { value: 250, unit: "ms" },
    },
    "duration-medium-2": {
      $type: "duration",
      $value: { value: 300, unit: "ms" },
    },
    "duration-medium-3": {
      $type: "duration",
      $value: { value: 350, unit: "ms" },
    },
    "duration-medium-4": {
      $type: "duration",
      $value: { value: 400, unit: "ms" },
    },
    "duration-long-1": {
      $type: "duration",
      $value: { value: 450, unit: "ms" },
    },
    "duration-long-2": {
      $type: "duration",
      $value: { value: 500, unit: "ms" },
    },
    "duration-long-3": {
      $type: "duration",
      $value: { value: 550, unit: "ms" },
    },
    "duration-long-4": {
      $type: "duration",
      $value: { value: 600, unit: "ms" },
    },
    "duration-extra-long-1": {
      $type: "duration",
      $value: { value: 700, unit: "ms" },
    },
    "duration-extra-long-2": {
      $type: "duration",
      $value: { value: 800, unit: "ms" },
    },
    "duration-extra-long-3": {
      $type: "duration",
      $value: { value: 900, unit: "ms" },
    },
    "duration-extra-long-4": {
      $type: "duration",
      $value: { value: 1000, unit: "ms" },
    },
    // State-layer opacities
    "state-hover": { $type: "number", $value: 0.08 },
    "state-focus": { $type: "number", $value: 0.12 },
    "state-pressed": { $type: "number", $value: 0.12 },
    "state-dragged": { $type: "number", $value: 0.16 },
    // Color roles — the M3 role-to-tone mapping for the light scheme; the
    // color modifier's dark context rebinds them
    primary: { $type: "color", $value: "{primary-40}" },
    "on-primary": { $type: "color", $value: "{primary-100}" },
    "primary-container": { $type: "color", $value: "{primary-90}" },
    "on-primary-container": { $type: "color", $value: "{primary-30}" },
    "primary-fixed": { $type: "color", $value: "{primary-90}" },
    "primary-fixed-dim": { $type: "color", $value: "{primary-80}" },
    "on-primary-fixed": { $type: "color", $value: "{primary-10}" },
    "on-primary-fixed-variant": { $type: "color", $value: "{primary-30}" },
    secondary: { $type: "color", $value: "{secondary-40}" },
    "on-secondary": { $type: "color", $value: "{secondary-100}" },
    "secondary-container": { $type: "color", $value: "{secondary-90}" },
    "on-secondary-container": { $type: "color", $value: "{secondary-30}" },
    "secondary-fixed": { $type: "color", $value: "{secondary-90}" },
    "secondary-fixed-dim": { $type: "color", $value: "{secondary-80}" },
    "on-secondary-fixed": { $type: "color", $value: "{secondary-10}" },
    "on-secondary-fixed-variant": { $type: "color", $value: "{secondary-30}" },
    tertiary: { $type: "color", $value: "{tertiary-40}" },
    "on-tertiary": { $type: "color", $value: "{tertiary-100}" },
    "tertiary-container": { $type: "color", $value: "{tertiary-90}" },
    "on-tertiary-container": { $type: "color", $value: "{tertiary-30}" },
    "tertiary-fixed": { $type: "color", $value: "{tertiary-90}" },
    "tertiary-fixed-dim": { $type: "color", $value: "{tertiary-80}" },
    "on-tertiary-fixed": { $type: "color", $value: "{tertiary-10}" },
    "on-tertiary-fixed-variant": { $type: "color", $value: "{tertiary-30}" },
    "inverse-primary": { $type: "color", $value: "{primary-80}" },
    error: { $type: "color", $value: "{error-40}" },
    "on-error": { $type: "color", $value: "{error-100}" },
    "error-container": { $type: "color", $value: "{error-90}" },
    "on-error-container": { $type: "color", $value: "{error-30}" },
    success: { $type: "color", $value: "{success-40}" },
    "on-success": { $type: "color", $value: "{success-100}" },
    "success-container": { $type: "color", $value: "{success-90}" },
    "on-success-container": { $type: "color", $value: "{success-30}" },
    warning: { $type: "color", $value: "{warning-40}" },
    "on-warning": { $type: "color", $value: "{warning-100}" },
    "warning-container": { $type: "color", $value: "{warning-90}" },
    "on-warning-container": { $type: "color", $value: "{warning-30}" },
    surface: { $type: "color", $value: "{neutral-98}" },
    "on-surface": { $type: "color", $value: "{neutral-10}" },
    "surface-dim": { $type: "color", $value: "{neutral-87}" },
    "surface-bright": { $type: "color", $value: "{neutral-98}" },
    "surface-container-lowest": { $type: "color", $value: "{neutral-100}" },
    "surface-container-low": { $type: "color", $value: "{neutral-96}" },
    "surface-container": { $type: "color", $value: "{neutral-94}" },
    "surface-container-high": { $type: "color", $value: "{neutral-92}" },
    "surface-container-highest": { $type: "color", $value: "{neutral-90}" },
    "surface-variant": { $type: "color", $value: "{neutral-variant-90}" },
    "on-surface-variant": { $type: "color", $value: "{neutral-variant-30}" },
    "surface-tint": { $type: "color", $value: "{primary-40}" },
    "inverse-surface": { $type: "color", $value: "{neutral-20}" },
    "inverse-on-surface": { $type: "color", $value: "{neutral-95}" },
    background: { $type: "color", $value: "{neutral-98}" },
    "on-background": { $type: "color", $value: "{neutral-10}" },
    outline: { $type: "color", $value: "{neutral-variant-50}" },
    "outline-variant": { $type: "color", $value: "{neutral-variant-80}" },
    shadow: { $type: "color", $value: "{neutral-0}" },
    scrim: { $type: "color", $value: "{neutral-0}" },
    // Contrast channels — the medium- and high-contrast target for every
    // role the contrast axis shifts, at the light scheme's tones; the color
    // modifier's dark context rebinds them so a contrast override resolves
    // correctly in either mode
    "primary-medium-contrast": { $type: "color", $value: "{primary-22}" },
    "primary-high-contrast": { $type: "color", $value: "{primary-17}" },
    "on-primary-medium-contrast": { $type: "color", $value: "{primary-100}" },
    "on-primary-high-contrast": { $type: "color", $value: "{primary-100}" },
    "primary-container-medium-contrast": {
      $type: "color",
      $value: "{primary-50}",
    },
    "primary-container-high-contrast": {
      $type: "color",
      $value: "{primary-30}",
    },
    "on-primary-container-medium-contrast": {
      $type: "color",
      $value: "{primary-100}",
    },
    "on-primary-container-high-contrast": {
      $type: "color",
      $value: "{primary-100}",
    },
    "secondary-medium-contrast": { $type: "color", $value: "{secondary-22}" },
    "secondary-high-contrast": { $type: "color", $value: "{secondary-17}" },
    "on-secondary-medium-contrast": {
      $type: "color",
      $value: "{secondary-100}",
    },
    "on-secondary-high-contrast": { $type: "color", $value: "{secondary-100}" },
    "secondary-container-medium-contrast": {
      $type: "color",
      $value: "{secondary-50}",
    },
    "secondary-container-high-contrast": {
      $type: "color",
      $value: "{secondary-30}",
    },
    "on-secondary-container-medium-contrast": {
      $type: "color",
      $value: "{secondary-100}",
    },
    "on-secondary-container-high-contrast": {
      $type: "color",
      $value: "{secondary-100}",
    },
    "tertiary-medium-contrast": { $type: "color", $value: "{tertiary-22}" },
    "tertiary-high-contrast": { $type: "color", $value: "{tertiary-17}" },
    "on-tertiary-medium-contrast": { $type: "color", $value: "{tertiary-100}" },
    "on-tertiary-high-contrast": { $type: "color", $value: "{tertiary-100}" },
    "tertiary-container-medium-contrast": {
      $type: "color",
      $value: "{tertiary-50}",
    },
    "tertiary-container-high-contrast": {
      $type: "color",
      $value: "{tertiary-30}",
    },
    "on-tertiary-container-medium-contrast": {
      $type: "color",
      $value: "{tertiary-100}",
    },
    "on-tertiary-container-high-contrast": {
      $type: "color",
      $value: "{tertiary-100}",
    },
    "inverse-primary-medium-contrast": {
      $type: "color",
      $value: "{primary-80}",
    },
    "inverse-primary-high-contrast": { $type: "color", $value: "{primary-80}" },
    "error-medium-contrast": { $type: "color", $value: "{error-22}" },
    "error-high-contrast": { $type: "color", $value: "{error-17}" },
    "on-error-medium-contrast": { $type: "color", $value: "{error-100}" },
    "on-error-high-contrast": { $type: "color", $value: "{error-100}" },
    "error-container-medium-contrast": { $type: "color", $value: "{error-50}" },
    "error-container-high-contrast": { $type: "color", $value: "{error-30}" },
    "on-error-container-medium-contrast": {
      $type: "color",
      $value: "{error-100}",
    },
    "on-error-container-high-contrast": {
      $type: "color",
      $value: "{error-100}",
    },
    "success-medium-contrast": { $type: "color", $value: "{success-22}" },
    "success-high-contrast": { $type: "color", $value: "{success-17}" },
    "on-success-medium-contrast": { $type: "color", $value: "{success-100}" },
    "on-success-high-contrast": { $type: "color", $value: "{success-100}" },
    "success-container-medium-contrast": {
      $type: "color",
      $value: "{success-50}",
    },
    "success-container-high-contrast": {
      $type: "color",
      $value: "{success-30}",
    },
    "on-success-container-medium-contrast": {
      $type: "color",
      $value: "{success-100}",
    },
    "on-success-container-high-contrast": {
      $type: "color",
      $value: "{success-100}",
    },
    "warning-medium-contrast": { $type: "color", $value: "{warning-22}" },
    "warning-high-contrast": { $type: "color", $value: "{warning-17}" },
    "on-warning-medium-contrast": { $type: "color", $value: "{warning-100}" },
    "on-warning-high-contrast": { $type: "color", $value: "{warning-100}" },
    "warning-container-medium-contrast": {
      $type: "color",
      $value: "{warning-50}",
    },
    "warning-container-high-contrast": {
      $type: "color",
      $value: "{warning-30}",
    },
    "on-warning-container-medium-contrast": {
      $type: "color",
      $value: "{warning-100}",
    },
    "on-warning-container-high-contrast": {
      $type: "color",
      $value: "{warning-100}",
    },
    "on-surface-medium-contrast": { $type: "color", $value: "{neutral-6}" },
    "on-surface-high-contrast": { $type: "color", $value: "{neutral-0}" },
    "surface-dim-medium-contrast": { $type: "color", $value: "{neutral-80}" },
    "surface-dim-high-contrast": { $type: "color", $value: "{neutral-80}" },
    "surface-bright-medium-contrast": {
      $type: "color",
      $value: "{neutral-98}",
    },
    "surface-bright-high-contrast": { $type: "color", $value: "{neutral-98}" },
    "surface-container-lowest-medium-contrast": {
      $type: "color",
      $value: "{neutral-100}",
    },
    "surface-container-lowest-high-contrast": {
      $type: "color",
      $value: "{neutral-100}",
    },
    "surface-container-low-medium-contrast": {
      $type: "color",
      $value: "{neutral-96}",
    },
    "surface-container-low-high-contrast": {
      $type: "color",
      $value: "{neutral-95}",
    },
    "surface-container-medium-contrast": {
      $type: "color",
      $value: "{neutral-92}",
    },
    "surface-container-high-contrast": {
      $type: "color",
      $value: "{neutral-90}",
    },
    "surface-container-high-medium-contrast": {
      $type: "color",
      $value: "{neutral-87}",
    },
    "surface-container-high-high-contrast": {
      $type: "color",
      $value: "{neutral-87}",
    },
    "surface-container-highest-medium-contrast": {
      $type: "color",
      $value: "{neutral-87}",
    },
    "surface-container-highest-high-contrast": {
      $type: "color",
      $value: "{neutral-80}",
    },
    "on-surface-variant-medium-contrast": {
      $type: "color",
      $value: "{neutral-variant-22}",
    },
    "on-surface-variant-high-contrast": {
      $type: "color",
      $value: "{neutral-variant-0}",
    },
    "inverse-on-surface-medium-contrast": {
      $type: "color",
      $value: "{neutral-95}",
    },
    "inverse-on-surface-high-contrast": {
      $type: "color",
      $value: "{neutral-100}",
    },
    "outline-medium-contrast": {
      $type: "color",
      $value: "{neutral-variant-35}",
    },
    "outline-high-contrast": { $type: "color", $value: "{neutral-variant-17}" },
    "outline-variant-medium-contrast": {
      $type: "color",
      $value: "{neutral-variant-50}",
    },
    "outline-variant-high-contrast": {
      $type: "color",
      $value: "{neutral-variant-30}",
    },
  },
  modifiers: {
    color: {
      light: {},
      dark: {
        primary: "{primary-80}",
        "on-primary": "{primary-20}",
        "primary-container": "{primary-30}",
        "on-primary-container": "{primary-90}",
        secondary: "{secondary-80}",
        "on-secondary": "{secondary-20}",
        "secondary-container": "{secondary-30}",
        "on-secondary-container": "{secondary-90}",
        tertiary: "{tertiary-80}",
        "on-tertiary": "{tertiary-20}",
        "tertiary-container": "{tertiary-30}",
        "on-tertiary-container": "{tertiary-90}",
        "inverse-primary": "{primary-40}",
        error: "{error-80}",
        "on-error": "{error-20}",
        "error-container": "{error-30}",
        "on-error-container": "{error-90}",
        success: "{success-80}",
        "on-success": "{success-20}",
        "success-container": "{success-30}",
        "on-success-container": "{success-90}",
        warning: "{warning-80}",
        "on-warning": "{warning-20}",
        "warning-container": "{warning-30}",
        "on-warning-container": "{warning-90}",
        surface: "{neutral-6}",
        "on-surface": "{neutral-90}",
        "surface-dim": "{neutral-6}",
        "surface-bright": "{neutral-24}",
        "surface-container-lowest": "{neutral-4}",
        "surface-container-low": "{neutral-10}",
        "surface-container": "{neutral-12}",
        "surface-container-high": "{neutral-17}",
        "surface-container-highest": "{neutral-22}",
        "surface-variant": "{neutral-variant-30}",
        "on-surface-variant": "{neutral-variant-80}",
        "surface-tint": "{primary-80}",
        "inverse-surface": "{neutral-90}",
        "inverse-on-surface": "{neutral-20}",
        background: "{neutral-6}",
        "on-background": "{neutral-90}",
        outline: "{neutral-variant-60}",
        "outline-variant": "{neutral-variant-30}",
        "primary-medium-contrast": "{primary-87}",
        "primary-high-contrast": "{primary-95}",
        "on-primary-medium-contrast": "{primary-17}",
        "on-primary-high-contrast": "{primary-0}",
        "primary-container-medium-contrast": "{primary-60}",
        "primary-container-high-contrast": "{primary-80}",
        "on-primary-container-medium-contrast": "{primary-0}",
        "on-primary-container-high-contrast": "{primary-4}",
        "secondary-medium-contrast": "{secondary-87}",
        "secondary-high-contrast": "{secondary-95}",
        "on-secondary-medium-contrast": "{secondary-17}",
        "on-secondary-high-contrast": "{secondary-0}",
        "secondary-container-medium-contrast": "{secondary-60}",
        "secondary-container-high-contrast": "{secondary-80}",
        "on-secondary-container-medium-contrast": "{secondary-0}",
        "on-secondary-container-high-contrast": "{secondary-4}",
        "tertiary-medium-contrast": "{tertiary-87}",
        "tertiary-high-contrast": "{tertiary-95}",
        "on-tertiary-medium-contrast": "{tertiary-17}",
        "on-tertiary-high-contrast": "{tertiary-0}",
        "tertiary-container-medium-contrast": "{tertiary-60}",
        "tertiary-container-high-contrast": "{tertiary-80}",
        "on-tertiary-container-medium-contrast": "{tertiary-0}",
        "on-tertiary-container-high-contrast": "{tertiary-4}",
        "inverse-primary-medium-contrast": "{primary-30}",
        "inverse-primary-high-contrast": "{primary-30}",
        "error-medium-contrast": "{error-87}",
        "error-high-contrast": "{error-95}",
        "on-error-medium-contrast": "{error-17}",
        "on-error-high-contrast": "{error-0}",
        "error-container-medium-contrast": "{error-60}",
        "error-container-high-contrast": "{error-80}",
        "on-error-container-medium-contrast": "{error-0}",
        "on-error-container-high-contrast": "{error-4}",
        "success-medium-contrast": "{success-87}",
        "success-high-contrast": "{success-95}",
        "on-success-medium-contrast": "{success-17}",
        "on-success-high-contrast": "{success-0}",
        "success-container-medium-contrast": "{success-60}",
        "success-container-high-contrast": "{success-80}",
        "on-success-container-medium-contrast": "{success-0}",
        "on-success-container-high-contrast": "{success-4}",
        "warning-medium-contrast": "{warning-87}",
        "warning-high-contrast": "{warning-95}",
        "on-warning-medium-contrast": "{warning-17}",
        "on-warning-high-contrast": "{warning-0}",
        "warning-container-medium-contrast": "{warning-60}",
        "warning-container-high-contrast": "{warning-80}",
        "on-warning-container-medium-contrast": "{warning-0}",
        "on-warning-container-high-contrast": "{warning-4}",
        "on-surface-medium-contrast": "{neutral-100}",
        "on-surface-high-contrast": "{neutral-100}",
        "surface-dim-medium-contrast": "{neutral-6}",
        "surface-dim-high-contrast": "{neutral-6}",
        "surface-bright-medium-contrast": "{neutral-30}",
        "surface-bright-high-contrast": "{neutral-35}",
        "surface-container-lowest-medium-contrast": "{neutral-0}",
        "surface-container-lowest-high-contrast": "{neutral-0}",
        "surface-container-low-medium-contrast": "{neutral-12}",
        "surface-container-low-high-contrast": "{neutral-12}",
        "surface-container-medium-contrast": "{neutral-17}",
        "surface-container-high-contrast": "{neutral-20}",
        "surface-container-high-medium-contrast": "{neutral-22}",
        "surface-container-high-high-contrast": "{neutral-25}",
        "surface-container-highest-medium-contrast": "{neutral-25}",
        "surface-container-highest-high-contrast": "{neutral-30}",
        "on-surface-variant-medium-contrast": "{neutral-variant-87}",
        "on-surface-variant-high-contrast": "{neutral-variant-100}",
        "inverse-on-surface-medium-contrast": "{neutral-17}",
        "inverse-on-surface-high-contrast": "{neutral-0}",
        "outline-medium-contrast": "{neutral-variant-70}",
        "outline-high-contrast": "{neutral-variant-95}",
        "outline-variant-medium-contrast": "{neutral-variant-60}",
        "outline-variant-high-contrast": "{neutral-variant-80}",
      },
    },
    contrast: {
      default: {},
      medium: {
        primary: "{primary-medium-contrast}",
        "on-primary": "{on-primary-medium-contrast}",
        "primary-container": "{primary-container-medium-contrast}",
        "on-primary-container": "{on-primary-container-medium-contrast}",
        secondary: "{secondary-medium-contrast}",
        "on-secondary": "{on-secondary-medium-contrast}",
        "secondary-container": "{secondary-container-medium-contrast}",
        "on-secondary-container": "{on-secondary-container-medium-contrast}",
        tertiary: "{tertiary-medium-contrast}",
        "on-tertiary": "{on-tertiary-medium-contrast}",
        "tertiary-container": "{tertiary-container-medium-contrast}",
        "on-tertiary-container": "{on-tertiary-container-medium-contrast}",
        "inverse-primary": "{inverse-primary-medium-contrast}",
        error: "{error-medium-contrast}",
        "on-error": "{on-error-medium-contrast}",
        "error-container": "{error-container-medium-contrast}",
        "on-error-container": "{on-error-container-medium-contrast}",
        success: "{success-medium-contrast}",
        "on-success": "{on-success-medium-contrast}",
        "success-container": "{success-container-medium-contrast}",
        "on-success-container": "{on-success-container-medium-contrast}",
        warning: "{warning-medium-contrast}",
        "on-warning": "{on-warning-medium-contrast}",
        "warning-container": "{warning-container-medium-contrast}",
        "on-warning-container": "{on-warning-container-medium-contrast}",
        "on-surface": "{on-surface-medium-contrast}",
        "surface-dim": "{surface-dim-medium-contrast}",
        "surface-bright": "{surface-bright-medium-contrast}",
        "surface-container-lowest":
          "{surface-container-lowest-medium-contrast}",
        "surface-container-low": "{surface-container-low-medium-contrast}",
        "surface-container": "{surface-container-medium-contrast}",
        "surface-container-high": "{surface-container-high-medium-contrast}",
        "surface-container-highest":
          "{surface-container-highest-medium-contrast}",
        "on-surface-variant": "{on-surface-variant-medium-contrast}",
        "inverse-on-surface": "{inverse-on-surface-medium-contrast}",
        outline: "{outline-medium-contrast}",
        "outline-variant": "{outline-variant-medium-contrast}",
      },
      high: {
        primary: "{primary-high-contrast}",
        "on-primary": "{on-primary-high-contrast}",
        "primary-container": "{primary-container-high-contrast}",
        "on-primary-container": "{on-primary-container-high-contrast}",
        secondary: "{secondary-high-contrast}",
        "on-secondary": "{on-secondary-high-contrast}",
        "secondary-container": "{secondary-container-high-contrast}",
        "on-secondary-container": "{on-secondary-container-high-contrast}",
        tertiary: "{tertiary-high-contrast}",
        "on-tertiary": "{on-tertiary-high-contrast}",
        "tertiary-container": "{tertiary-container-high-contrast}",
        "on-tertiary-container": "{on-tertiary-container-high-contrast}",
        "inverse-primary": "{inverse-primary-high-contrast}",
        error: "{error-high-contrast}",
        "on-error": "{on-error-high-contrast}",
        "error-container": "{error-container-high-contrast}",
        "on-error-container": "{on-error-container-high-contrast}",
        success: "{success-high-contrast}",
        "on-success": "{on-success-high-contrast}",
        "success-container": "{success-container-high-contrast}",
        "on-success-container": "{on-success-container-high-contrast}",
        warning: "{warning-high-contrast}",
        "on-warning": "{on-warning-high-contrast}",
        "warning-container": "{warning-container-high-contrast}",
        "on-warning-container": "{on-warning-container-high-contrast}",
        "on-surface": "{on-surface-high-contrast}",
        "surface-dim": "{surface-dim-high-contrast}",
        "surface-bright": "{surface-bright-high-contrast}",
        "surface-container-lowest": "{surface-container-lowest-high-contrast}",
        "surface-container-low": "{surface-container-low-high-contrast}",
        "surface-container": "{surface-container-high-contrast}",
        "surface-container-high": "{surface-container-high-high-contrast}",
        "surface-container-highest":
          "{surface-container-highest-high-contrast}",
        "on-surface-variant": "{on-surface-variant-high-contrast}",
        "inverse-on-surface": "{inverse-on-surface-high-contrast}",
        outline: "{outline-high-contrast}",
        "outline-variant": "{outline-variant-high-contrast}",
      },
    },
    text: {
      md: {},
      sm: {
        "display-large-size": { value: 50, unit: "px" },
        "display-large-line-height": { value: 56, unit: "px" },
        "display-medium-size": { value: 39, unit: "px" },
        "display-medium-line-height": { value: 46, unit: "px" },
        "display-small-size": { value: 32, unit: "px" },
        "display-small-line-height": { value: 40, unit: "px" },
        "headline-large-size": { value: 28, unit: "px" },
        "headline-large-line-height": { value: 36, unit: "px" },
        "headline-medium-size": { value: 24, unit: "px" },
        "headline-medium-line-height": { value: 32, unit: "px" },
        "headline-small-size": { value: 21, unit: "px" },
        "headline-small-line-height": { value: 28, unit: "px" },
        "title-large-size": { value: 19, unit: "px" },
        "title-large-line-height": { value: 26, unit: "px" },
        "title-medium-size": { value: 14, unit: "px" },
        "title-medium-line-height": { value: 22, unit: "px" },
        "title-small-size": { value: 12, unit: "px" },
        "title-small-line-height": { value: 18, unit: "px" },
        "body-large-size": { value: 14, unit: "px" },
        "body-large-line-height": { value: 22, unit: "px" },
        "body-medium-size": { value: 12, unit: "px" },
        "body-medium-line-height": { value: 18, unit: "px" },
        "body-small-size": { value: 11, unit: "px" },
        "body-small-line-height": { value: 14, unit: "px" },
        "label-large-size": { value: 12, unit: "px" },
        "label-large-line-height": { value: 18, unit: "px" },
        "label-medium-size": { value: 11, unit: "px" },
        "label-medium-line-height": { value: 14, unit: "px" },
        "label-small-size": { value: 10, unit: "px" },
        "label-small-line-height": { value: 14, unit: "px" },
      },
      lg: {
        "display-large-size": { value: 64, unit: "px" },
        "display-large-line-height": { value: 72, unit: "px" },
        "display-medium-size": { value: 51, unit: "px" },
        "display-medium-line-height": { value: 58, unit: "px" },
        "display-small-size": { value: 40, unit: "px" },
        "display-small-line-height": { value: 48, unit: "px" },
        "headline-large-size": { value: 36, unit: "px" },
        "headline-large-line-height": { value: 44, unit: "px" },
        "headline-medium-size": { value: 32, unit: "px" },
        "headline-medium-line-height": { value: 40, unit: "px" },
        "headline-small-size": { value: 27, unit: "px" },
        "headline-small-line-height": { value: 36, unit: "px" },
        "title-large-size": { value: 25, unit: "px" },
        "title-large-line-height": { value: 32, unit: "px" },
        "title-medium-size": { value: 18, unit: "px" },
        "title-medium-line-height": { value: 26, unit: "px" },
        "title-small-size": { value: 16, unit: "px" },
        "title-small-line-height": { value: 22, unit: "px" },
        "body-large-size": { value: 18, unit: "px" },
        "body-large-line-height": { value: 26, unit: "px" },
        "body-medium-size": { value: 16, unit: "px" },
        "body-medium-line-height": { value: 22, unit: "px" },
        "body-small-size": { value: 13, unit: "px" },
        "body-small-line-height": { value: 18, unit: "px" },
        "label-large-size": { value: 16, unit: "px" },
        "label-large-line-height": { value: 22, unit: "px" },
        "label-medium-size": { value: 13, unit: "px" },
        "label-medium-line-height": { value: 18, unit: "px" },
        "label-small-size": { value: 12, unit: "px" },
        "label-small-line-height": { value: 18, unit: "px" },
      },
    },
    density: {
      default: {},
      compact: {
        "space-extra-small": { value: 2, unit: "px" },
        "space-small": { value: 6, unit: "px" },
        "space-medium": { value: 12, unit: "px" },
        "space-large": { value: 18, unit: "px" },
        "space-extra-large": { value: 24, unit: "px" },
        "space-extra-extra-large": { value: 36, unit: "px" },
        "control-height-small": { value: 28, unit: "px" },
        "control-height-medium": { value: 36, unit: "px" },
        "control-height-large": { value: 48, unit: "px" },
        "control-gap": { value: 6, unit: "px" },
        "control-padding": { value: 12, unit: "px" },
      },
      spacious: {
        "space-extra-small": { value: 6, unit: "px" },
        "space-small": { value: 12, unit: "px" },
        "space-medium": { value: 20, unit: "px" },
        "space-large": { value: 32, unit: "px" },
        "space-extra-large": { value: 40, unit: "px" },
        "space-extra-extra-large": { value: 64, unit: "px" },
        "control-height-small": { value: 36, unit: "px" },
        "control-height-medium": { value: 44, unit: "px" },
        "control-height-large": { value: 64, unit: "px" },
        "control-gap": { value: 10, unit: "px" },
        "control-padding": { value: 20, unit: "px" },
      },
    },
    radius: {
      default: {},
      sharp: {
        "shape-extra-small": { value: 0, unit: "px" },
        "shape-small": { value: 0, unit: "px" },
        "shape-medium": { value: 0, unit: "px" },
        "shape-large": { value: 0, unit: "px" },
        "shape-large-increased": { value: 0, unit: "px" },
        "shape-extra-large": { value: 0, unit: "px" },
        "shape-extra-large-increased": { value: 0, unit: "px" },
        "shape-extra-extra-large": { value: 0, unit: "px" },
        "shape-full": { value: 0, unit: "px" },
      },
      round: {
        "shape-extra-small": { value: 8, unit: "px" },
        "shape-small": { value: 12, unit: "px" },
        "shape-medium": { value: 16, unit: "px" },
        "shape-large": { value: 24, unit: "px" },
        "shape-large-increased": { value: 28, unit: "px" },
        "shape-extra-large": { value: 32, unit: "px" },
        "shape-extra-large-increased": { value: 40, unit: "px" },
        "shape-extra-extra-large": { value: 56, unit: "px" },
      },
    },
    motion: {
      default: {},
      reduced: {
        "duration-short-1": { value: 0, unit: "ms" },
        "duration-short-2": { value: 0, unit: "ms" },
        "duration-short-3": { value: 0, unit: "ms" },
        "duration-short-4": { value: 0, unit: "ms" },
        "duration-medium-1": { value: 0, unit: "ms" },
        "duration-medium-2": { value: 0, unit: "ms" },
        "duration-medium-3": { value: 0, unit: "ms" },
        "duration-medium-4": { value: 0, unit: "ms" },
        "duration-long-1": { value: 0, unit: "ms" },
        "duration-long-2": { value: 0, unit: "ms" },
        "duration-long-3": { value: 0, unit: "ms" },
        "duration-long-4": { value: 0, unit: "ms" },
        "duration-extra-long-1": { value: 0, unit: "ms" },
        "duration-extra-long-2": { value: 0, unit: "ms" },
        "duration-extra-long-3": { value: 0, unit: "ms" },
        "duration-extra-long-4": { value: 0, unit: "ms" },
      },
    },
  },
  order: ["color", "contrast", "text", "density", "radius", "motion"],
});
