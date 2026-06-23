import type { RADIX_STEPS, RADIX_SCALES } from "./constant";

/**
 * Union of the 12 Radix scale steps.
 */
export type RadixStep = (typeof RADIX_STEPS)[number];

/**
 * Union of all Radix scale names (chromatic + neutral).
 */
export type RadixScale = (typeof RADIX_SCALES)[number];

/**
 * A reference token key for a light-mode scale step, e.g. `blue-9`.
 */
export type RadixLightRef<N extends string> = `${N}-${RadixStep}`;

/**
 * A reference token key for a dark-mode scale step, e.g. `blue-dark-9`.
 */
export type RadixDarkRef<N extends string> = `${N}-dark-${RadixStep}`;
