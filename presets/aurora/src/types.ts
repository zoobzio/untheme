import type { preset } from "./preset";

/**
 * The complete theme the preset resolves layers against — the base contract
 * with every token, modifier context, and the composition order.
 */
export type AuroraTheme = ReturnType<(typeof preset)["define"]>;

/**
 * A variant layer over the base contract: identity plus the token bindings it
 * rebinds. Theme files default-export this shape, carrying only their eight
 * re-seeded tonal ramps.
 */
export type AuroraLayer = Parameters<(typeof preset)["define"]>[0];

/**
 * A selection of one context per modifier axis, e.g.
 * `{ color: "dark", contrast: "high", text: "md", density: "compact",
 * radius: "default", motion: "default" }`.
 */
export type AuroraInput = Parameters<(typeof preset)["use"]>[0];
