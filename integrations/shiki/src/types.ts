import type { Template, Token } from "untheme";

import type { SEMANTIC_TYPES } from "./constant";

/**
 * A role in the shipped vocabulary. The type is one LSP `SemanticTokenType`
 * from {@link SEMANTIC_TYPES}.
 */
export type SemanticType = (typeof SEMANTIC_TYPES)[number];

/**
 * A font style that a scope rule can set.
 */
export type FontStyle = "italic" | "bold" | "underline" | "strikethrough";

/**
 * A rule that sets the color and font style of TextMate scopes. `scope` is one
 * scope or an array of scopes. `role` selects the token from the map. A rule
 * for a style-only scope, such as `emphasis`, has no `role`. `R` is the type
 * of the role. The default is `SemanticType`.
 */
export type ScopeRule<R extends string = SemanticType> = {
  scope: string | string[];
  role?: R;
  fontStyle?: FontStyle | FontStyle[];
};

/**
 * A map from roles to tokens in the contract. Each `SemanticType` key is
 * optional. A scope with an unmapped role renders in the default foreground
 * color. The map also accepts any other string as a key, for use with custom
 * scope rules. `defineShikiTheme` checks each value against the contract.
 */
export type SyntaxMap<T extends Template> = {
  [role in SemanticType]?: Token<T>;
} & {
  [role: string]: Token<T> | undefined;
};

/**
 * The options of `defineShikiTheme`. `scopes` adds rules after `BASIC_SCOPES`.
 * A rule that names a base scope replaces the base rule. The `role` of such a
 * rule can be any key of the map. `fg` and `bg` are the tokens for the
 * foreground and background colors of the whole code block. `name` and `type`
 * set the name and the type of the Shiki theme.
 */
export type ShikiOptions<T extends Template> = {
  name?: string;
  type?: "light" | "dark";
  fg?: Token<T>;
  bg?: Token<T>;
  scopes?: ScopeRule<string>[];
};
