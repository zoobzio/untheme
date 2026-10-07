import type { Resolver, ResolverModifierNormalized } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";

import { entries, map } from "objectively";
import { delta } from "@untheme/utils";

import { binding, collisions, definition } from "./convert";

/**
 * The collation Terrazzo alphabetizes by: natural, numeric-aware, en-US. One
 * collator for the build — the parser builds one per comparison and re-sorts
 * every group index on every resolution, which is why the kit runs it with
 * `alphabetize` off and orders each token set here instead.
 */
const collator = new Intl.Collator("en-us", { numeric: true });

/**
 * A token set re-keyed in Terrazzo's alphabetical order, so the emitted
 * modules read exactly as a parse with `alphabetize` on would have written
 * them.
 */
export const sorted = <T>(set: Record<string, T>): Record<string, T> =>
  Object.fromEntries(entries(set).sort(([a], [b]) => collator.compare(a, b)));

/**
 * The pieces of a base theme read off a resolver document: the complete token
 * map at the all-defaults selection, each modifier's contexts as sparse
 * override maps, the composition order, and the boot selection. Untyped
 * beyond structure — the schema adjudicates validity after assembly.
 */
export interface Skeleton {
  tokens: Record<string, Record<string, unknown>>;
  modifiers: Record<string, Record<string, Record<string, unknown>>>;
  order: string[];
  input: Record<string, string>;
}

/**
 * Whether a modifier is Terrazzo's own legacy-mode bridge rather than an axis
 * the user authored: a document parsed without a resolver gets a synthetic
 * `tzMode` modifier whose only context is `"."`. It conveys nothing and must
 * not become an untheme axis.
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
 * The resolver's authored modifiers, in resolution order, with the synthetic
 * legacy bridge filtered out. Read off the normalized `resolutionOrder`, where
 * Terrazzo has inlined every modifier the order applies — one declared in the
 * top-level `modifiers` map and referenced by `$ref`, and one declared inline
 * in the order itself, alike. The top-level map alone misses the inline form.
 */
export const axes = (
  resolver: Resolver | undefined,
): ResolverModifierNormalized[] => {
  const found: ResolverModifierNormalized[] = [];
  for (const entry of resolver?.source.resolutionOrder ?? []) {
    if (entry.type !== "modifier") {
      continue;
    }
    if (synthetic(entry.name, Object.keys(entry.contexts))) {
      continue;
    }
    found.push(entry);
  }
  return found;
};

/**
 * Whether the resolver is Terrazzo's synthetic stand-in for a plain token
 * document: it applies modifiers, and every one is the legacy bridge.
 */
export const bridged = (resolver: Resolver | undefined): boolean => {
  const modifiers = (resolver?.source.resolutionOrder ?? []).filter(
    (entry) => entry.type === "modifier",
  );
  return (
    modifiers.length > 0 &&
    modifiers.every((entry) =>
      synthetic(entry.name, Object.keys(entry.contexts)),
    )
  );
};

/**
 * Reads the base theme's pieces directly off the resolver document. The
 * all-defaults application is the base; each non-default context is applied
 * one modifier at a time and diffed against it, so a context carries exactly
 * what it changes. Default contexts stay empty — base tokens are the default
 * context. Sets in the resolution order fold into the base via `apply`; only
 * modifiers become axes. Without authored modifiers (a plain token document)
 * the tokens stand alone: no axes, no order, empty selection.
 */
export const skeleton = (
  resolver: Resolver | undefined,
  tokens: TokenNormalizedSet,
): Skeleton => {
  const modifiers = axes(resolver);
  if (!resolver || modifiers.length === 0) {
    collisions(Object.keys(tokens));
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
  collisions(Object.keys(base));
  const flat = map(base, binding);

  const contexts: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const modifier of modifiers) {
    const name = modifier.name;
    const overrides: Record<string, Record<string, unknown>> = {};
    for (const context of Object.keys(modifier.contexts)) {
      if (context === modifier.default) {
        overrides[context] = {};
        continue;
      }
      const applied = sorted(resolver.apply({ ...input, [name]: context }));
      const alien = Object.keys(applied).filter((key) => !(key in base));
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
