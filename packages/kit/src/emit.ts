import type { Core, OutputFile } from "./types";
import { describe } from "./describe";
import { banner, json, pair, union } from "./print";

/**
 * Returns the modifier structure as a type literal. The literal maps each
 * modifier to its contexts, and each context to `Overrides`. This is the `Mod`
 * parameter of the untheme `Contract`. The literal is `{}` when the theme has no
 * modifiers.
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
 * Makes the root entry. It has the token names, the modifier names, their
 * guards, and the explicit unions that every other declaration uses.
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
 * Makes the `./config` entry. It has the base theme, the boot selection, and the
 * `{ theme, input }` config that `useUnthemeConfig` seeds a runtime container
 * from. The declarations use the token and modifier unions.
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
 * Makes the `./manifest` entry. It lists each modifier and each of its contexts
 * with an id, a display name, and a description. An interface lists these to let
 * a person choose. The entry is its own module.
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
 * Emits every file of a build.
 *
 * - `index` has the `Token`, `Modifier`, `Mod`, and `Context` types, the token
 *   and modifier lists, `isToken`, and `isModifier`.
 * - `config` has the base theme, the boot selection, and `{ theme, input }` for
 *   `useUnthemeConfig`.
 * - `manifest` has each modifier and context with its id, name, and description.
 *
 * Each module is an `.mjs` file with a `.d.mts` file beside it. The runtime
 * renders CSS from the active theme.
 *
 * The function takes a {@link Core}. A consumer that holds a built theme and
 * selection, such as a framework module, can emit the same modules that the CLI
 * writes.
 *
 * @param core - The base theme, the boot selection, and the manifest when the
 * consumer has one.
 */
export const emit = (core: Core): OutputFile[] => {
  return [...index(core), ...config(core), ...manifest(core)];
};
