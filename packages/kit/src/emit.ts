import type { Core, OutputFile } from "./types";
import { describe } from "./describe";
import { banner, json, pair, union } from "./print";

/**
 * The modifier structure as a type literal: each modifier mapped to its
 * contexts, each context to the `Overrides` it may carry — the `Mod`
 * parameter of untheme's `Contract`. `{}` when the theme has no modifiers.
 */
const structure = (modifiers: Core["theme"]["modifiers"]): string => {
  const axes = Object.entries(modifiers);
  if (axes.length === 0) {
    return "{}";
  }
  const lines = axes.map(([modifier, contexts]) => {
    const members = Object.keys(contexts)
      .map((context) => `${JSON.stringify(context)}: Overrides`)
      .join("; ");
    return `  ${JSON.stringify(modifier)}: { ${members} };`;
  });
  return `{\n${lines.join("\n")}\n}`;
};

/**
 * The root entry: the token and modifier names, their guards, and the
 * explicit unions every other declaration is typed by. Carries no token data,
 * so importing a guard never pulls the theme into a bundle.
 */
const index = (core: Core): OutputFile[] => {
  const { theme } = core;
  const tokens = Object.keys(theme.tokens);
  const modifiers = Object.fromEntries(
    theme.order.map((modifier) => [
      modifier,
      Object.keys(theme.modifiers[modifier] ?? {}),
    ]),
  );
  return pair(
    "index",
    [
      banner(theme.id),
      `export const tokens = Object.freeze(${json(tokens)});`,
      `export const modifiers = Object.freeze(${json(modifiers)});`,
      "const known = new Set(tokens);",
      `export const isToken = (value) => typeof value === "string" && known.has(value);`,
      `export const isModifier = (value) => typeof value === "string" && Object.hasOwn(modifiers, value);`,
    ],
    [
      banner(theme.id),
      'import type { Binding } from "untheme";',
      `export type Token =${union(tokens)};`,
      "export type Overrides = Partial<Record<Token, Binding>>;",
      `export type Modifier =${union(theme.order)};`,
      `export type Mod = ${structure(theme.modifiers)};`,
      "export type Context<M extends Modifier> = keyof Mod[M] & string;",
      "export declare const tokens: readonly Token[];",
      "export declare const modifiers: { readonly [M in Modifier]: readonly Context<M>[] };",
      "export declare const isToken: (value: unknown) => value is Token;",
      "export declare const isModifier: (value: unknown) => value is Modifier;",
    ],
  );
};

/**
 * The `./config` entry: the base theme and boot selection, and the
 * `{ theme, input }` config `useUnthemeConfig` seeds a runtime container
 * from. Plain data — no runtime import of untheme — typed against the exact
 * token and modifier unions.
 */
const config = (core: Core): OutputFile[] =>
  pair(
    "config",
    [
      banner(core.theme.id),
      `export const theme = ${json(core.theme)};`,
      `export const input = ${json(core.input)};`,
      "export default { theme, input };",
    ],
    [
      banner(core.theme.id),
      'import type { Contract as UnthemeContract, Input } from "untheme";',
      'import type { UnthemeConfig } from "untheme/config";',
      'import type { Mod, Token } from "./index.mjs";',
      "export type Contract = UnthemeContract<Token, Mod>;",
      "export declare const theme: Contract;",
      "export declare const input: Input<Contract>;",
      "declare const config: UnthemeConfig<Contract>;",
      "export default config;",
    ],
  );

/**
 * The `./manifest` entry: every modifier and each of its contexts with an
 * id, a display name and a description — what an interface lists to let
 * someone choose. Its own module, so a page that offers no choice never
 * loads the prose.
 */
const manifest = (core: Core): OutputFile[] =>
  pair(
    "manifest",
    [
      banner(core.theme.id),
      `export const manifest = ${json(core.manifest ?? describe(core.theme))};`,
      "export default manifest;",
    ],
    [
      banner(core.theme.id),
      'import type { Context, Modifier } from "./index.mjs";',
      "export interface Entry<Id extends string = string> {",
      "  readonly id: Id;",
      "  readonly name: string;",
      "  readonly description?: string;",
      "}",
      "export type ModifierEntry<M extends Modifier = Modifier> = M extends Modifier",
      "  ? Entry<M> & { readonly contexts: readonly Entry<Context<M>>[] }",
      "  : never;",
      "export declare const manifest: readonly ModifierEntry[];",
      "export default manifest;",
    ],
  );

/**
 * Emits every file a build produces —
 *
 * - `index` — `Token` / `Modifier` / `Mod` / `Context` types, the token and
 *   modifier lists, `isToken`, `isModifier`
 * - `config` — the base theme and boot selection, and `{ theme, input }` for
 *   `useUnthemeConfig`
 * - `manifest` — each modifier and context with its id, name and description
 *
 * each module as an `.mjs` with its `.d.mts` beside it. No theme layers and
 * no CSS: the runtime renders CSS from the active theme.
 *
 * Takes only the {@link Core}, so a consumer that already holds a built theme
 * and selection (a framework module) emits the same modules the CLI writes.
 *
 * @param core - The base theme and boot selection, and the manifest when
 * the consumer has one.
 */
export const emit = (core: Core): OutputFile[] => {
  return [...index(core), ...config(core), ...manifest(core)];
};
