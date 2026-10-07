import type { ThemeRegistrationRaw } from "shiki";
import type { Schema, Template, Token } from "untheme";

import type { ShikiOptions, SyntaxMap } from "./types";
import { SEMANTIC } from "./constant";
import { BASIC_SCOPES } from "./scopes";
import { reference, style } from "./util";
import { SyntaxMappingError } from "./error";

/**
 * Makes a Shiki theme from a map of roles to tokens. The color of each scope
 * is a `var()` reference to the token that the role maps to. The highlighted
 * output changes color when a modifier context or theme layer rebinds those
 * tokens.
 *
 * `schema` is `untheme.schema`. The function checks that each token in `map`,
 * `options.fg`, and `options.bg` exists in the contract and has the type
 * `color`. The function throws a {@link SyntaxMappingError} that lists each
 * invalid binding. A scope with an unmapped role renders in the default
 * foreground color. The function applies `BASIC_SCOPES`, then the rules in
 * `options.scopes`. A rule in `options.scopes` replaces a base rule that names
 * the same scope.
 */
export const defineShikiTheme = <T extends Template>(
  schema: Schema<T>,
  map: SyntaxMap<T>,
  options: ShikiOptions<T> = {},
): ThemeRegistrationRaw => {
  const problems: string[] = [];

  const check = (label: string, token: Token<T>): void => {
    const slot = schema.base.tokens[token];
    if (!schema.check.token(token) || slot === undefined) {
      problems.push(`${label} → "${token}" names no token in the contract`);
      return;
    }

    if (slot.$type !== "color") {
      problems.push(
        `${label} → "${token}" is a ${slot.$type} token, not a color`,
      );
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
