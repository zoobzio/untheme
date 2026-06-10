import type { CarbonTheme } from "./types";

import g10g90 from "./data/g10-g90";
import g10g100 from "./data/g10-g100";
import whiteg90 from "./data/white-g90";

export * from "./types";

/** The collection of built-in Carbon theme variants, keyed by theme key. */
export default {
  "g10-g90": g10g90,
  "g10-g100": g10g100,
  "white-g90": whiteg90,
} satisfies { [theme: string]: CarbonTheme };
