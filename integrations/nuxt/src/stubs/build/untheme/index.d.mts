// Typecheck-only stub for the generated `#build/untheme/index.mjs` virtual
// module, in the shape `@untheme/kit` emits for the stub theme.
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

export type Modifier = "color";

export type Mod = {
  color: { light: Overrides; dark: Overrides };
};

export type Context<M extends Modifier> = keyof Mod[M] & string;
