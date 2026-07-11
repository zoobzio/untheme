import type { Resolver } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";

import { map } from "untheme/common";
import { delta } from "untheme";

import { binding, collisions, definition } from "./convert";

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
 * The resolver's authored modifiers, with the synthetic legacy bridge
 * filtered out.
 */
const authored = (
  resolver: Resolver | undefined,
): Record<
  string,
  { contexts: Record<string, unknown>; default: string | undefined }
> => {
  const axes: Record<
    string,
    { contexts: Record<string, unknown>; default: string | undefined }
  > = {};
  for (const [name, modifier] of Object.entries(
    resolver?.source.modifiers ?? {},
  )) {
    if (synthetic(name, Object.keys(modifier.contexts))) {
      continue;
    }
    axes[name] = modifier;
  }
  return axes;
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
  const axes = authored(resolver);
  if (!resolver || Object.keys(axes).length === 0) {
    collisions(Object.keys(tokens));
    return {
      tokens: map(tokens, definition),
      modifiers: {},
      order: [],
      input: {},
    };
  }

  const input: Record<string, string> = {};
  for (const [name, modifier] of Object.entries(axes)) {
    if (modifier.default === undefined) {
      throw new Error(
        `untheme terrazzo: modifier "${name}" declares no default context — untheme boots one context per modifier; add "default" to the modifier in the resolver document`,
      );
    }
    input[name] = modifier.default;
  }

  const base = resolver.apply(input);
  collisions(Object.keys(base));
  const flat = map(base, binding);

  const modifiers: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const [name, modifier] of Object.entries(axes)) {
    const contexts: Record<string, Record<string, unknown>> = {};
    for (const context of Object.keys(modifier.contexts)) {
      if (context === modifier.default) {
        contexts[context] = {};
        continue;
      }
      const applied = resolver.apply({ ...input, [name]: context });
      const alien = Object.keys(applied).filter((key) => !(key in base));
      if (alien.length > 0) {
        throw new Error(
          `untheme terrazzo: context "${context}" of modifier "${name}" introduces tokens missing from the base contract: ${alien.join(", ")} — a context may only rebind base tokens`,
        );
      }
      contexts[context] = delta(flat, map(applied, binding));
    }
    modifiers[name] = contexts;
  }

  const order: string[] = [];
  for (const entry of resolver.source.resolutionOrder) {
    if (entry.type === "modifier" && entry.name in axes) {
      order.push(entry.name);
    }
  }

  return { tokens: map(base, definition), modifiers, order, input };
};
