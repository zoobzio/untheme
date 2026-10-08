import type { Context, Modifier, Template, Token } from "untheme";
import type { UnthemeConfig } from "untheme/config";
import type { Manifest } from "@untheme/kit";
import type { ModulesOptions, Selection } from "./types";

import { mockInput } from "./input";
import { mockManifest } from "./manifest";

/**
 * The `index` module of a build. It has the frozen token and modifier lists
 * and the `isToken` and `isModifier` guards.
 */
export interface IndexModule<T extends Template> {
  tokens: readonly Token<T>[];
  modifiers: { readonly [M in Modifier<T>]: readonly Context<T, M>[] };
  isToken: (value: unknown) => value is Token<T>;
  isModifier: (value: unknown) => value is Modifier<T>;
}

/**
 * The `config` module of a build. It has the base theme and the boot
 * selection as named exports and as the default export.
 */
export interface ConfigModule<T extends Template> extends UnthemeConfig<T> {
  default: UnthemeConfig<T>;
}

/**
 * The `manifest` module of a build. It has the manifest as a named export and
 * as the default export.
 */
export interface ManifestModule {
  manifest: Manifest;
  default: Manifest;
}

/**
 * The three modules of a build, as module namespaces.
 */
export interface Modules<T extends Template> {
  index: IndexModule<T>;
  config: ConfigModule<T>;
  manifest: ManifestModule;
}

/**
 * Returns the `index` module that `untheme build` writes for a theme. It has
 * the same lists and guards. A test mocks the module with it or uses its
 * guards.
 *
 * @param theme - The theme that the module describes.
 */
export const mockIndex = <T extends Template>(theme: T): IndexModule<T> => {
  const tokens = Object.freeze(Object.keys(theme.tokens) as Token<T>[]);
  const modifiers = Object.freeze(
    Object.fromEntries(
      theme.order.map((modifier) => [
        modifier,
        Object.freeze(Object.keys(theme.modifiers[modifier] ?? {})),
      ]),
    ),
  ) as IndexModule<T>["modifiers"];
  const known = new Set<string>(tokens);
  return {
    tokens,
    modifiers,
    isToken: (value): value is Token<T> =>
      typeof value === "string" && known.has(value),
    isModifier: (value): value is Modifier<T> =>
      typeof value === "string" && Object.hasOwn(modifiers, value),
  };
};

/**
 * Returns the `config` module that `untheme build` writes for a theme. It has
 * the theme and a boot selection as named exports and as the default export.
 * The module holds the theme as passed, like the data of the real module.
 *
 * @param theme - The theme that the module holds.
 * @param selection - The contexts to boot at.
 */
export const mockConfig = <T extends Template>(
  theme: T,
  selection: Selection<T> = {},
): ConfigModule<T> => {
  const config: UnthemeConfig<T> = {
    theme,
    input: mockInput(theme, selection),
  };
  return { ...config, default: config };
};

/**
 * Returns the three modules that `untheme build` writes to its output
 * directory, as module namespaces over a theme. The modules are `index`,
 * `config`, and `manifest`. A test uses them in place of the output of a
 * build. Each one is what a `vi.mock` factory of that module returns.
 *
 * @param theme - The theme that the modules describe.
 * @param options - The boot selection and the prose of the manifest.
 */
export const mockModules = <T extends Template>(
  theme: T,
  options: ModulesOptions<T> = {},
): Modules<T> => {
  const manifest = mockManifest(theme, options.prose);
  return {
    index: mockIndex(theme),
    config: mockConfig(theme, options.selection),
    manifest: { manifest, default: manifest },
  };
};
