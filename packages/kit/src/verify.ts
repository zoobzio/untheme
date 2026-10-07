import type { Resolver } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";
import type { Input, Template, Theme } from "@untheme/schema";

import { entries, equals, keys } from "objectively";
import { makeUntheme } from "@untheme/core";

import { axes } from "./contexts";
import { literal } from "./convert";

/**
 * Checks that Terrazzo and untheme agree on the final value of every token. The
 * check compares the resolution of Terrazzo with the untheme composition of the
 * generated theme, at every reachable selection. A mismatch is a bug in the kit
 * and aborts the build. When the resolver cannot enumerate its permutations, the
 * check runs the defaults plus every single-context deviation. The skeleton was
 * read from the same applications.
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
   * The selections to check. The first is the input. Then come the permutations
   * that the resolver lists. Otherwise, each single-context deviation follows.
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
     * The Terrazzo selection can hold modifiers that the theme has no axis for,
     * such as the synthetic `tzMode` modifier. The untheme input holds the axes
     * of the theme. The default fills a missing value.
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
