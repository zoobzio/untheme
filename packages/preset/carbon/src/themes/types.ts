import { defineCarbonTheme } from "../preset";

/** A theme produced by `defineCarbonTheme` — the shape of every built-in Carbon variant. */
export type CarbonTheme = ReturnType<typeof defineCarbonTheme>;
