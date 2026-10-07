import type { Context, Modifier, Overrides, Template } from "@untheme/schema";

/**
 * The difference between two themes. {@link diff} returns it. It has a token
 * override map and an override map for each context of each modifier. A map is
 * empty when the themes have the same bindings.
 */
export type Diff<T extends Template> = {
  tokens: Overrides<T>;
  modifiers: { [M in Modifier<T>]: { [C in Context<T, M>]: Overrides<T> } };
};

/**
 * A partial overlay of a theme. It can have any of the identity, the tokens,
 * the modifiers, and the order. A `Layer` and a `Patch` both have this shape.
 */
export type Overlay<T extends Template> = {
  id?: string;
  name?: string;
  tokens?: Overrides<T>;
  modifiers?: { [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> } };
  order?: NoInfer<Modifier<T>>[];
};
