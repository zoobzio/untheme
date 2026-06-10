import { defineM2Theme } from "../preset";

/** A theme produced by `defineM2Theme` — the shape of every built-in M2 variant. */
export type M2Theme = ReturnType<typeof defineM2Theme>;
