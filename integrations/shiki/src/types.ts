import type { Template, Token } from "untheme";

import type { SEMANTIC_TYPES } from "./constant";

/**
 * A role in the shipped vocabulary: one LSP `SemanticTokenType`, derived from
 * {@link SEMANTIC_TYPES} so the value stays the single source of truth.
 */
export type SemanticType = (typeof SEMANTIC_TYPES)[number];

/**
 * A font style a scope can carry on its own, independent of color. Shiki
 * accepts these space-joined in a single `fontStyle` string.
 */
export type FontStyle = "italic" | "bold" | "underline" | "strikethrough";

/**
 * One entry in a scope map: the TextMate scope(s) it covers, the role its
 * tokens resolve through (absent for style-only scopes like `emphasis`), and
 * any font style. `R` is the role vocabulary — `SemanticType` for the packs we
 * ship, but open, so a user's own rules can name any role their map declares.
 */
export type ScopeRule<R extends string = SemanticType> = {
  scope: string | string[];
  role?: R;
  fontStyle?: FontStyle | FontStyle[];
};

/**
 * The interchange the user supplies: each role bound to a token in their
 * contract. The LSP roles autocomplete and are optional — an unmapped role
 * leaves its scopes at the default foreground — and the map stays open, so a
 * user pairs custom scope rules with custom roles. Every value is a real
 * `Token<T>`, checked against the contract.
 */
export type SyntaxMap<T extends Template> = {
  [role in SemanticType]?: Token<T>;
} & {
  [role: string]: Token<T> | undefined;
};

/**
 * Extra knobs on the generated theme. `scopes` are extra rules layered over the
 * always-applied universal set — add only what you want beyond it; a rule that
 * names a base scope overrides it, and a rule's `role` is open, so it can reach
 * anything TextMate distinguishes that the strict-LSP base leaves out. `fg` /
 * `bg` set the theme's top-level foreground and background — the `<pre>`/`<code>`
 * colors Shiki stamps on a whole block. `name` and `type` carry through to the
 * registration Shiki files the theme under.
 */
export type ShikiOptions<T extends Template> = {
  name?: string;
  type?: "light" | "dark";
  fg?: Token<T>;
  bg?: Token<T>;
  scopes?: ScopeRule<string>[];
};
