import type { RadixTheme } from "./types";

import blue from "./data/blue";
import crimson from "./data/crimson";
import cyan from "./data/cyan";
import grass from "./data/grass";
import orange from "./data/orange";
import teal from "./data/teal";

export * from "./types";

/** The collection of built-in Radix theme variants, keyed by theme key. */
export default {
  blue,
  crimson,
  cyan,
  grass,
  orange,
  teal,
} satisfies { [theme: string]: RadixTheme };
