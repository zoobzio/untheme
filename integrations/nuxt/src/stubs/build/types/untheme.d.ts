// Typecheck-only stub for the generated `#build/types/untheme.d.ts` virtual module.
import type { Binding } from "untheme";

export type Token =
  | "white"
  | "black"
  | "blue"
  | "indigo"
  | "surface"
  | "on-surface"
  | "primary";

export type Overrides = Partial<Record<Token, Binding>>;

export type Mod = {
  color: {
    light: Overrides;
    dark: Overrides;
  };
};
