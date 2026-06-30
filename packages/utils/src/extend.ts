import type { Contract } from "@untheme/schema";
import type { Extension } from "./types";

/**
 * Widens a base contract with an {@link Extension} into a fresh contract over
 * the union token and modifier sets. Neither input is mutated.
 *
 * Two behaviors with different merge semantics:
 *   - `extend` adds new tokens and new modifiers — a **spread**, since there is
 *     nothing existing to preserve.
 *   - `override` rebinds existing tokens (a spread — a token binding is a single
 *     value) and rebinds existing modifier contexts (a **deep merge**, since a
 *     context holds a token map that must merge token by token, not be replaced).
 */
export const extend = <
  Tok extends string,
  Mod extends Record<string, Record<string, Partial<Record<string, string>>>>,
  XTok extends string,
  XMod extends Record<string, Record<string, Partial<Record<string, string>>>>,
>(
  base: Contract<Tok, Mod>,
  extension: Extension<Tok, Mod, XTok, XMod>,
): Contract<Tok | XTok, Mod & XMod> => {
  const tokens = { ...base.tokens, ...extension.tokens };

  const modifiers = structuredClone({
    ...extension.modifiers,
    ...base.modifiers,
  });
  for (const mod of Object.keys(extension.modifiers)) {
    if (mod in base.modifiers) {
      for (const ctx of Object.keys(extension.modifiers[mod])) {
        if (ctx in base.modifiers[mod]) {
          Object.assign(modifiers[mod][ctx], {
            ...base.modifiers[mod][ctx],
            ...extension.modifiers[mod][ctx],
          });
        }
      }
    }
  }

  const listed = new Set(extension.order);
  const order = [
    ...base.order.filter((mod) => !listed.has(mod)),
    ...extension.order,
  ];

  return structuredClone({
    id: extension.id,
    name: extension.name,
    tokens,
    modifiers,
    order,
  });
};
