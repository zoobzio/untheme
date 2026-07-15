import type { ThemeRegistrationRaw } from "shiki";
import type { Schema, Template, Token } from "untheme";

import type { ShikiOptions, SyntaxMap } from "./types";
import { SEMANTIC } from "./constant";
import { BASIC_SCOPES } from "./scopes";
import { reference, style } from "./util";
import { SyntaxMappingError } from "./error";

/**
 * Builds a Shiki theme from a `role → token` map. Every scope's color is
 * emitted as the `var()` indirection to the token its role resolves to, so the
 * highlighted output re-themes when a modifier context or theme layer rebinds
 * those tokens — no re-highlight, the same live-reference cascade the CSS
 * renderer relies on. Register the result with Shiki once; it never regenerates.
 *
 * `schema` (`untheme.schema`) anchors the token type and re-proves the map at
 * call time: every bound token must exist and be a color, or a
 * {@link SyntaxMappingError} lists what's wrong. `map` is the interchange the
 * user owns — the LSP roles the shipped `scopes` produce, bound to their
 * tokens; a role left unmapped leaves its scopes at the default foreground.
 * The universal `BASIC_SCOPES` always applies; `options.scopes` adds rules on
 * top, overriding the base where they name the same scope.
 */
export const defineShikiTheme = <T extends Template>(
  schema: Schema<T>,
  map: SyntaxMap<T>,
  options: ShikiOptions<T> = {},
): ThemeRegistrationRaw => {
  const problems: string[] = [];

  const check = (label: string, token: Token<T>): void => {
    if (!schema.check.token(token)) {
      problems.push(`${label} → "${token}" names no token in the contract`);
      return;
    }

    const type = schema.base.tokens[token].$type;
    if (type !== "color") {
      problems.push(`${label} → "${token}" is a ${type} token, not a color`);
    }
  };

  for (const [role, token] of Object.entries(map)) {
    if (token !== undefined) {
      check(role, token);
    }
  }

  if (options.fg !== undefined) {
    check("fg", options.fg);
  }

  if (options.bg !== undefined) {
    check("bg", options.bg);
  }

  if (problems.length > 0) {
    throw new SyntaxMappingError(problems);
  }

  const scopes = [...BASIC_SCOPES, ...(options.scopes ?? [])];

  const settings = scopes.map((rule) => {
    const value: { foreground?: string; fontStyle?: string } = {};

    if (rule.role !== undefined) {
      const token = map[rule.role];
      if (token !== undefined) {
        value.foreground = reference(token);
      }
    }

    if (rule.fontStyle) {
      value.fontStyle = style(rule.fontStyle);
    }

    return { scope: rule.scope, settings: value };
  });

  const semanticTokenColors: Record<string, string> = {};
  for (const [name, role] of Object.entries(SEMANTIC)) {
    const token = map[role];
    if (token !== undefined) {
      semanticTokenColors[name] = reference(token);
    }
  }

  const theme: ThemeRegistrationRaw = {
    name: options.name ?? "untheme",
    type: options.type ?? "dark",
    semanticHighlighting: true,
    semanticTokenColors,
    settings,
  };

  if (options.fg !== undefined) {
    theme.fg = reference(options.fg);
  }

  if (options.bg !== undefined) {
    theme.bg = reference(options.bg);
  }

  return theme;
};
