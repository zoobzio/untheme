import type {
  Contract,
  Overrides,
  SharedBinding,
  Slot,
  Theme,
} from "@untheme/schema";
import type { Extension } from "./types";

import { map, isDefinition } from "@untheme/common";
import { copy } from "./copy";
import { traverse } from "./traverse";

/**
 * Widens a base contract with an {@link Extension} into a fresh contract over
 * the union token and modifier sets. Neither input is mutated.
 *
 * Tokens compose two ways: an extension key that already names a base token
 * rebinds that token's `$value`, preserving its `$type` and metadata; an
 * extension key beyond the base inserts its full definition as a new token.
 * Modifiers spread the new axes over the base's, then deep-merge each context
 * the two share, the extension's bindings winning per token.
 *
 * The base may be an authored contract or any complete {@link Theme} of one —
 * a machine-built theme (a prior extension's output) widens the same way.
 */
export const extend = <
  Tok extends string,
  Mod extends Record<string, Record<string, object>>,
  XTok extends string,
  XMod extends Record<string, Record<string, object>>,
>(
  base: Contract<Tok, Mod> | Theme<Contract<Tok, Mod>>,
  extension: Extension<Tok, Mod, XTok, XMod>,
) => {
  type Base = Contract<Tok, Mod>;

  const source = Object.assign({}, extension.tokens, base.tokens);
  const tokens = map(source, (slot, token) => {
    if (slot === undefined || !isDefinition(slot)) {
      throw new TypeError(`token "${token}" is not a definition`);
    }
    const definition: Slot<Tok | XTok> = slot;
    const incoming: SharedBinding<Tok | XTok> | Slot<Tok | XTok> | undefined =
      extension.tokens[token];
    if (incoming === undefined || isDefinition(incoming)) {
      return copy(definition);
    }
    const rebound: Slot<Tok | XTok> = {
      ...copy(definition),
      $value: copy(incoming),
    };
    return rebound;
  });

  const modifiers = {
    ...copy(extension.modifiers),
    ...traverse<Base, Overrides<Base>>(base.modifiers, (overrides, at) => ({
      ...copy(overrides),
      ...copy(at(extension.modifiers) ?? {}),
    })),
  };

  const listed = new Set<string>(extension.order);
  const order = [
    ...base.order.filter((modifier) => !listed.has(modifier)),
    ...extension.order,
  ];

  const result = {
    id: extension.id,
    name: extension.name,
    tokens,
    modifiers,
    order,
  };

  return result;
};
