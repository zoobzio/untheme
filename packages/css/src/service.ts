import type { Template, Token, Type } from "@untheme/schema";
import type { Inputs, Renderer, Source, Variable, Variables } from "./types";

import { entries, map } from "@untheme/common";

import { property } from "./property";
import { emit, serialize } from "./serialize";

/**
 * Creates a CSS {@link Renderer} over a {@link Source} — typically the core
 * service itself: `defineRenderer(untheme)`.
 *
 * The source carries everything the renderer reads: the active flat bindings,
 * and the active theme — whose slots declare each token's type and whose
 * modifier contexts back the static sheet. Every read happens lazily at
 * render time, so a renderer inside a reactive scope re-renders when the
 * state it read changes, the same way the core service tracks through its
 * container. Input is trusted: the core service validates everything it
 * holds, so bindings arrive matching their declared types and serialization
 * re-proves nothing.
 *
 * References always render as `var()` indirections — whole-value or nested in
 * a composite slot — so a rebind of the target cascades through the
 * custom-property graph instead of being baked into each dependent.
 *
 * @param source - The service (or matching container) rendering reads from.
 * @returns A {@link Renderer} bound to the source.
 */
export const defineRenderer = <T extends Template>(
  source: Source<T>,
): Renderer<T> => {
  /**
   * The declarations for a set of bindings: every emission of every bound
   * token, each keyed by the token's custom property name plus the emission's
   * suffix. Loosely keyed, since a generic template's tokens, overrides, and
   * bindings all erase to string keys; every caller hands it contract-keyed
   * records. The cast asserts the fold produced exactly the variable keys;
   * safe because each token's `""`-suffixed emission lands its own variable
   * name and only typography's sibling suffix adds another.
   */
  const declarations = (
    bindings: Partial<Record<string, Inputs[Type]>>,
  ): Variables<Token<T>> => {
    const slots = source.config.theme.tokens;
    const acc: Record<string, string> = {};
    for (const [token, binding] of entries(bindings)) {
      if (binding === undefined) {
        continue;
      }
      for (const [suffix, text] of entries(
        emit<Type>(slots[token].$type, binding),
      )) {
        acc[`${property(token)}${suffix}`] = text;
      }
    }
    return acc as Variables<Token<T>>;
  };

  /**
   * A selector block over a set of declarations, one per line.
   */
  const block = (selector: string, decls: Record<string, string>): string => {
    const lines = entries(decls).map(([name, text]) => ` ${name}: ${text};`);
    return [`${selector} {`, ...lines, "}"].join("\n");
  };

  /**
   * The custom property name for a token.
   */
  const prop = <K extends Token<T>>(token: K): Variable<K> => {
    return property(token);
  };

  /**
   * The var() accessor for a token's custom property.
   */
  const indirect = <K extends Token<T>>(token: K): `var(${Variable<K>})` => {
    return `var(${property(token)})`;
  };

  /**
   * One token's active binding as CSS text: its serialized value, or its
   * `var()` indirection when the binding is a reference.
   */
  const value = (token: Token<T>): string => {
    return serialize<Type>(
      source.config.theme.tokens[token].$type,
      source.tokens()[token],
    );
  };

  /**
   * Every active declaration as data: the flat bindings folded into a record
   * of custom property name to CSS text, directly spreadable into a style
   * object.
   */
  const variables = (): Variables<Token<T>> => {
    return declarations(source.tokens());
  };

  /**
   * A single `:root` block over the active declarations, or `""` when the
   * contract holds no tokens.
   */
  const root = (): string => {
    const decls = variables();
    if (Object.keys(decls).length === 0) {
      return "";
    }
    return block(":root", decls);
  };

  /**
   * The full static cascade: the base bindings under `:root`, then each
   * modifier context's overrides under a `[data-<modifier>="<context>"]`
   * block, in composition order. Selecting a context is then a data-attribute
   * flip on the document root — the blocks share the root's specificity, so
   * later blocks win, mirroring the service's composition order. A context
   * without overrides emits no block: the base bindings already are the
   * default context.
   */
  const sheet = (): string => {
    const theme = source.config.theme;
    const base = declarations(map(theme.tokens, (slot) => slot.$value));
    if (Object.keys(base).length === 0) {
      return "";
    }
    const blocks = [block(":root", base)];
    for (const modifier of theme.order) {
      for (const [context, overrides] of entries(theme.modifiers[modifier])) {
        const decls = declarations(overrides);
        if (Object.keys(decls).length === 0) {
          continue;
        }
        blocks.push(block(`[data-${modifier}="${context}"]`, decls));
      }
    }
    return blocks.join("\n");
  };

  return {
    property: prop,
    var: indirect,
    value,
    variables,
    root,
    sheet,
  };
};
