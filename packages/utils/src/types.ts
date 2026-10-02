import type { Context, Modifier, Overrides, Template } from "@untheme/schema";

/**
 * The deviation between two themes, as produced by {@link diff}: a token
 * override map and per-modifier, per-context override maps, all present (empty
 * when nothing deviates) so consumers can inspect them without guards.
 */
export type Diff<T extends Template> = {
  tokens: Overrides<T>;
  modifiers: { [M in Modifier<T>]: { [C in Context<T, M>]: Overrides<T> } };
};

/**
 * A partial overlay of a theme: any subset of identity, tokens, modifiers, and
 * order. Both a `Layer` (identity plus partial overrides) and a `Patch`
 * (anonymous overrides) fit this shape, so one merge serves them all.
 */
export type Overlay<T extends Template> = {
  id?: string;
  name?: string;
  tokens?: Overrides<T>;
  modifiers?: { [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> } };
  order?: NoInfer<Modifier<T>>[];
};
