import type { M3_TONES } from "./constant";

/**
 * Union of all M3 tonal palette tone stops.
 */
export type M3Tone = (typeof M3_TONES)[number];
