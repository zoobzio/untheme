import type {
  Context,
  Modifier,
  Modifiers,
  Overrides,
  Template,
} from "@untheme/schema";

import { remap } from "@untheme/common";

/**
 * Rebuilds a modifiers structure leaf by leaf: every context of every modifier
 * mapped through the callback, each modifier keeping its own context keys. The
 * callback's `at` indexes any other modifiers structure at the leaf's own
 * coordinates, so a leaf can be combined with its counterpart elsewhere; a
 * sparse structure — a layer's or patch's partial modifier map — may hold
 * nothing there, so `at` yields the overrides or `undefined`. The
 * modifier/context pairing is carried generically here, checked once; callers
 * supply only the leaf operation.
 */
export const traverse = <T extends Template, R>(
  modifiers: Modifiers<T>,
  fn: (
    overrides: Overrides<T>,
    at: (other: {
      [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> };
    }) => Overrides<T> | undefined,
  ) => R,
): { [M in Modifier<T>]: { [C in Context<T, M>]: R } } =>
  remap<Modifiers<T>, { [M in Modifier<T>]: { [C in Context<T, M>]: R } }>(
    modifiers,
    <M extends Modifier<T>>(
      contexts: Modifiers<T>[M],
      modifier: M,
    ): { [C in Context<T, M>]: R } =>
      remap<Modifiers<T>[M], { [C in Context<T, M>]: R }>(
        contexts,
        (overrides, context) =>
          fn(overrides, (other) => other[modifier]?.[context]),
      ),
  );
