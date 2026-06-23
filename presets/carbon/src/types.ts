import type { CARBON_GRADES } from "./constant";

/**
 * Union of the 10 Carbon color grades (10–100).
 */
export type CarbonGrade = (typeof CARBON_GRADES)[number];

/**
 * A reference token key for a family grade, e.g. `blue-60`.
 */
export type CarbonRef<N extends string> = `${N}-${CarbonGrade}`;
