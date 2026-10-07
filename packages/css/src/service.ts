import type { Template, Token, Type } from "@untheme/schema";
import type {
  Bindings,
  Inputs,
  Renderer,
  Source,
  Variable,
  Variables,
} from "./types";

import { entries, map } from "objectively";

import { property } from "./property";
import { emit, serialize } from "./serialize";

/**
 * Creates a CSS {@link Renderer} from a {@link Source}. Pass the core service,
 * as in `defineRenderer(untheme)`.
 *
 * The renderer reads the active flat bindings and the active theme from the
 * source. The theme slots declare the type of each token. The theme modifier
 * contexts give the static sheet. The renderer reads at render time. A renderer
 * in a reactive scope renders again when the state that it read changes. The
 * renderer assumes that each binding matches the declared type of its token.
 *
 * A reference renders as a `var()` to the custom property of the target token.
 * This applies to a whole-value reference and to a reference in a composite
 * slot.
 *
 * @param source - The service, or a container with the same members.
 * @returns A {@link Renderer} for the source.
 */
export const defineRenderer = <T extends Template>(
  source: Source<T>,
): Renderer<T> => {
  /**
   * Makes the declarations for a set of bindings. The function emits each token
   * under its custom property name plus the suffix of each emission. A binding
   * that is a token name becomes the `{reference}` of that token.
   */
  const declarations = (
    bindings: Partial<Record<string, Inputs[Type]>>,
  ): Variables<Token<T>> => {
    const slots = source.config.theme.tokens;
    const acc: Record<string, string> = {};
    for (const [token, binding] of entries(bindings)) {
      const slot = slots[token];
      if (binding === undefined || slot === undefined) {
        continue;
      }
      const resolved =
        typeof binding === "string" && slots[binding] !== undefined
          ? `{${binding}}`
          : binding;
      for (const [suffix, text] of entries(emit<Type>(slot.$type, resolved))) {
        acc[`${property(token)}${suffix}`] = text;
      }
    }
    return acc as Variables<Token<T>>;
  };

  /**
   * Makes a selector block with one declaration on each line.
   */
  const block = (selector: string, decls: Record<string, string>): string => {
    const lines = entries(decls).map(([name, text]) => ` ${name}: ${text};`);
    return [`${selector} {`, ...lines, "}"].join("\n");
  };

  /**
   * Makes the attribute selector for a modifier context. The function escapes
   * both names.
   */
  const attribute = (modifier: string, context: string): string => {
    const name = modifier.replace(/[^a-zA-Z0-9_-]/g, (found) => `\\${found}`);
    const value = context.replace(/["\\]/g, (found) => `\\${found}`);
    return `[data-${name}="${value}"]`;
  };

  const prop = <K extends Token<T>>(token: K): Variable<K> => {
    return property(token);
  };

  const indirect = <K extends Token<T>>(token: K): `var(${Variable<K>})` => {
    return `var(${property(token)})`;
  };

  /**
   * Returns the active binding of a token as CSS text. The text is the
   * serialized value, or a `var()` reference when the binding is a reference. A
   * token outside the contract returns empty text.
   */
  const value = (token: Token<T>): string => {
    const slot = source.config.theme.tokens[token];
    if (slot === undefined) {
      return "";
    }
    return serialize<Type>(slot.$type, source.tokens()[token]);
  };

  /**
   * Returns each active declaration as a record of custom property name to CSS
   * text. The record can spread into a style object. With a static set of
   * bindings, the function uses that set.
   */
  const variables = (bindings?: Bindings<T>): Variables<Token<T>> => {
    return declarations(bindings ?? source.tokens());
  };

  /**
   * Returns a `:root` block for the active declarations, or for a static set of
   * bindings. Returns `""` when there are no declarations.
   */
  const root = (bindings?: Bindings<T>): string => {
    const decls = variables(bindings);
    if (Object.keys(decls).length === 0) {
      return "";
    }
    return block(":root", decls);
  };

  /**
   * Returns the base bindings under `:root`, then the overrides of each
   * modifier context under a `[data-<modifier>="<context>"]` block. The blocks
   * follow the composition order. A context with no overrides has no block. A
   * data attribute on the document root selects a context. A later block
   * overrides an earlier block.
   */
  const sheet = (): string => {
    const theme = source.config.theme;
    const base = declarations(map(theme.tokens, (slot) => slot.$value));
    if (Object.keys(base).length === 0) {
      return "";
    }
    const blocks = [block(":root", base)];
    for (const modifier of theme.order) {
      const contexts = theme.modifiers[modifier];
      if (contexts === undefined) {
        continue;
      }
      for (const [context, overrides] of entries(contexts)) {
        const decls = declarations(overrides);
        if (Object.keys(decls).length === 0) {
          continue;
        }
        blocks.push(block(attribute(modifier, context), decls));
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
