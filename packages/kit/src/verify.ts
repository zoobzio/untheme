import type { Resolver } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";
import type { Input, Template, Theme } from "@untheme/schema";

import { entries, equals, keys } from "objectively";
import { makeUntheme } from "@untheme/core";

import { axes } from "./contexts";
import { literal } from "./convert";

/**
 * Proves the translation faithful: Terrazzo's own resolution and untheme's
 * composition of the generated theme must agree on every token's final value,
 * at every reachable selection. A mismatch is a bug in this package, never in
 * the user's document, and aborts the build. When the resolver deems its
 * permutation space too large to enumerate, the proof falls back to the
 * defaults plus every single-context deviation — the same applications the
 * skeleton was read from.
 */
export const verify = (
  resolver: Resolver | undefined,
  tokens: TokenNormalizedSet,
  base: Theme<Template>,
  input: Input<Template>,
): void => {
  const service = makeUntheme<Template>({
    theme: base,
    input,
    override: {},
  });

  /*
   * Every selection to prove, most specific enumeration first: the resolver's
   * own permutation list, else defaults plus single-context deviations, else
   * (no resolver) just the base.
   */
  const selections: Record<string, string>[] = [{ ...input }];
  if (resolver?.listPermutations) {
    selections.push(...resolver.listPermutations());
  } else {
    for (const modifier of axes(resolver)) {
      for (const context of keys(modifier.contexts)) {
        if (context !== input[modifier.name]) {
          selections.push({ ...input, [modifier.name]: context });
        }
      }
    }
  }

  for (const selection of selections) {
    let applied = tokens;
    if (resolver) {
      applied = resolver.apply(selection);
    }

    /*
     * Terrazzo's selection may carry modifiers the theme doesn't (the
     * synthetic legacy-mode bridge); untheme's input holds exactly the
     * theme's own axes, defaults filling any gap.
     */
    const trimmed: Record<string, string> = {};
    for (const [axis, fallback] of entries(input)) {
      trimmed[axis] = selection[axis] ?? fallback;
    }
    service.config.input = service.schema.parse.input(trimmed);
    const drifted: string[] = [];
    for (const [token, normalized] of entries(applied)) {
      const expected = literal(normalized);
      const actual = service.resolve(token);
      if (!equals(expected, actual)) {
        drifted.push(token);
      }
    }
    if (drifted.length > 0) {
      throw new Error(
        `@untheme/kit: translation drift at selection ${JSON.stringify(selection)} — Terrazzo and untheme disagree on: ${drifted.join(", ")}. This is a bug in @untheme/kit.`,
      );
    }
  }
};
