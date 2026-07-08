// Typecheck-only stub for the generated `#build/types/untheme.d.ts` virtual module.
import type { SharedBinding } from "untheme";

export type Token =
  | "white"
  | "black"
  | "blue"
  | "indigo"
  | "surface"
  | "on-surface"
  | "primary";

export type Overrides = Partial<Record<Token, SharedBinding<Token>>>;

export type Mod = {
  color: {
    light: Overrides;
    dark: Overrides;
  };
};
