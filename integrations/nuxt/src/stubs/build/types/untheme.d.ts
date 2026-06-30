// Typecheck-only stub for the generated `#build/types/untheme.d.ts` virtual module.
export type Token =
  | "white"
  | "black"
  | "blue"
  | "indigo"
  | "surface"
  | "on-surface"
  | "primary";

export type Mod = {
  color: {
    light: Partial<Record<Token, string>>;
    dark: Partial<Record<Token, string>>;
  };
};
