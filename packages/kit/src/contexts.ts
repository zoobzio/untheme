import type { Resolver, ResolverModifierNormalized } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";

import { keys, map, sort } from "objectively";
import { delta } from "@untheme/utils";

import { binding, collisions, definition } from "./convert";

/**
 * The collation that Terrazzo sorts by: natural, numeric-aware, en-US. The kit
 * makes one collator for the build. The kit runs the parser with `alphabetize`
 * off and orders each token set with this collator.
 */
const collator = new Intl.Collator("en-us", { numeric: true });

/**
 * Returns a token set with its keys in the alphabetical order of Terrazzo.
 */
export const sorted = <T>(set: Record<string, T>): Record<string, T> =>
  sort(set, collator.compare);

/**
 * The pieces of a base theme that the kit reads from a resolver document.
 * `tokens` is the complete token map at the all-defaults selection. `modifiers`
 * holds the contexts of each modifier as sparse override maps. `order` is the
 * composition order. `input` is the boot selection. The schema validates the
 * pieces after assembly.
 */
export interface Skeleton {
  tokens: Record<string, Record<string, unknown>>;
  modifiers: Record<string, Record<string, Record<string, unknown>>>;
  order: string[];
  input: Record<string, string>;
}

/**
 * Whether a modifier is the synthetic `tzMode` modifier. Terrazzo adds it to a
 * bare token document. Its only context is `"."`.
 */
export const synthetic = (name: string, contexts: string[]): boolean => {
  if (name !== "tzMode") {
    return false;
  }
  if (contexts.length !== 1) {
    return false;
  }
  return contexts[0] === ".";
};

/**
 * Returns the modifiers that the resolver authors, in resolution order. The
 * function skips the synthetic `tzMode` modifier. The function reads the
 * normalized `resolutionOrder`, where Terrazzo has inlined each modifier that
 * the order applies. This includes a modifier declared in the top-level
 * `modifiers` map and referenced with `$ref`, and a modifier declared inline in
 * the order.
 */
export const axes = (
  resolver: Resolver | undefined,
): ResolverModifierNormalized[] => {
  const found: ResolverModifierNormalized[] = [];
  for (const entry of resolver?.source.resolutionOrder ?? []) {
    if (entry.type !== "modifier") {
      continue;
    }
    if (synthetic(entry.name, keys(entry.contexts))) {
      continue;
    }
    found.push(entry);
  }
  return found;
};

/**
 * Whether the resolver is the synthetic resolver that Terrazzo makes for a plain
 * token document. Such a resolver applies modifiers, and all of them are the
 * synthetic `tzMode` modifier.
 */
export const bridged = (resolver: Resolver | undefined): boolean => {
  const modifiers = (resolver?.source.resolutionOrder ?? []).filter(
    (entry) => entry.type === "modifier",
  );
  return (
    modifiers.length > 0 &&
    modifiers.every((entry) => synthetic(entry.name, keys(entry.contexts)))
  );
};

/**
 * Reads the pieces of the base theme from the resolver document. The base is the
 * all-defaults application. The function applies each non-default context, one
 * modifier at a time, and diffs it against the base. A context holds only what
 * it changes. A default context is empty, and the base tokens are the tokens of
 * the default context. Sets in the resolution order become part of the base
 * through `apply`. Only modifiers become axes. A plain token document has no
 * authored modifiers. For it, the function returns the tokens with no axes, no
 * order, and an empty selection.
 */
export const skeleton = (
  resolver: Resolver | undefined,
  tokens: TokenNormalizedSet,
): Skeleton => {
  const modifiers = axes(resolver);
  if (!resolver || modifiers.length === 0) {
    collisions(keys(tokens));
    return {
      tokens: map(sorted(tokens), definition),
      modifiers: {},
      order: [],
      input: {},
    };
  }

  const input: Record<string, string> = {};
  for (const modifier of modifiers) {
    const name = modifier.name;
    if (modifier.default === undefined) {
      throw new Error(
        `@untheme/kit: modifier "${name}" declares no default context — untheme boots one context per modifier; add "default" to the modifier in the resolver document`,
      );
    }
    input[name] = modifier.default;
  }

  const base = sorted(resolver.apply(input));
  collisions(keys(base));
  const flat = map(base, binding);

  const contexts: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const modifier of modifiers) {
    const name = modifier.name;
    const overrides: Record<string, Record<string, unknown>> = {};
    for (const context of keys(modifier.contexts)) {
      if (context === modifier.default) {
        overrides[context] = {};
        continue;
      }
      const applied = sorted(resolver.apply({ ...input, [name]: context }));
      const alien = keys(applied).filter((key) => !(key in base));
      if (alien.length > 0) {
        throw new Error(
          `@untheme/kit: context "${context}" of modifier "${name}" introduces tokens missing from the base contract: ${alien.join(", ")} — a context may only rebind base tokens`,
        );
      }
      overrides[context] = delta(flat, map(applied, binding));
    }
    contexts[name] = overrides;
  }

  return {
    tokens: map(base, definition),
    modifiers: contexts,
    order: modifiers.map((modifier) => modifier.name),
    input,
  };
};
