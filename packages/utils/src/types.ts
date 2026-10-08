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
