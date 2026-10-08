import type {
  Authored,
  Binding,
  Context,
  Input,
  Modifier,
  Template,
} from "untheme";
import type { BuiltLayer, Entry, Manifest } from "@untheme/kit";

/**
 * A terse token value. A test writes one of these in place of a full DTCG
 * definition. Each form fixes the type of the token.
 *
 * - `"#3b82f6"` is a hex color with 3, 4, 6, or 8 digits. It is an sRGB
 *   `color`.
 * - `"8px"` and `"0.5rem"` are a `dimension`.
 * - `"200ms"` and `"1s"` are a `duration`.
 * - `12` is a `number`.
 * - `"{other}"` is a reference. It has the type of its target.
 * - `{ $type, $value }` is a full definition, for every other type.
 */
export type Terse = string | number | Authored;

/**
 * A terse override. A modifier context rebinds a token to one of these. The
 * forms are the same as {@link Terse}, plus any structured value. A context
 * never restates the type of a token, so a full definition is not accepted.
 */
export type TerseBinding = string | Binding;

/**
 * The modifier structure of a {@link ThemeSpec}. Each modifier has contexts,
 * and each context has the tokens that it rebinds. Every override names a
 * token that the spec defines.
 */
export type ModifierSpec<Tok extends string> = Record<
  string,
  Record<string, Partial<Record<Tok, TerseBinding>>>
>;

/**
 * The input of {@link mockTheme}. It has the tokens in terse form, the
 * modifiers in terse form, and an optional identity and order.
 */
export interface ThemeSpec<Tok extends string, Mod extends ModifierSpec<Tok>> {
  /** The id of the theme. Defaults to `mock`. */
  id?: string;

  /** The display name of the theme. Defaults to `Mock`. */
  name?: string;

  /** Every token, each as a {@link Terse} value. */
  tokens: { [K in Tok]: Terse };

  /** The modifiers. Each is a map of contexts, and each context has its overrides. */
  modifiers?: Mod;

  /**
   * The composition order of the modifiers. Defaults to the order of the
   * `modifiers` member.
   */
  order?: (keyof Mod & string)[];
}

/**
 * The modifier structure of a spec as the `Mod` parameter of the untheme
 * `Contract`. It has the same modifier and context names. Every override is
 * a binding.
 */
export type Shape<Mod> = {
  -readonly [M in keyof Mod]: {
    -readonly [C in keyof Mod[M]]: {
      -readonly [K in keyof Mod[M][C]]: Binding;
    };
  };
};

/**
 * A partial selection. A test pins some contexts. The other modifiers boot
 * at their first context.
 */
export type Selection<T extends Template> = Partial<Input<T>>;

/**
 * The prose of a manifest entry. A name and a description, both optional.
 */
export type ProseEntry = Partial<Omit<Entry, "id">>;

/**
 * The names and descriptions of a mock manifest, by modifier and by context.
 * An entry without prose has its id as a titled name and no description. That
 * is what the kit emits for a document that authors no prose.
 */
export type Prose<T extends Template> = {
  [M in Modifier<T>]?: ProseEntry & {
    contexts?: { [C in Context<T, M>]?: ProseEntry };
  };
};

/**
 * Options for {@link mockKit}. They set the members of the kit other than the
 * theme.
 */
export interface KitOptions<T extends Template> {
  /** The contexts to boot at. The other modifiers boot at their first context. */
  selection?: Selection<T>;

  /** The names and descriptions of the manifest. */
  prose?: Prose<T>;

  /** A manifest to use as is, in place of one built from the theme. */
  manifest?: Manifest;

  /** The layers of the kit. Defaults to none. */
  layers?: BuiltLayer[];

  /** The output directory, relative to the project root. Defaults to `untheme`. */
  outDir?: string;

  /** The documents that the build reports as read. Defaults to none. */
  documents?: string[];
}

/**
 * Options for {@link mockModules}. They set the selection of the config module
 * and the prose of the manifest module.
 */
export interface ModulesOptions<T extends Template> {
  /** The contexts to boot at. The other modifiers boot at their first context. */
  selection?: Selection<T>;

  /** The names and descriptions of the manifest. */
  prose?: Prose<T>;
}

/**
 * Options for {@link selections} and {@link proveTheme}.
 */
export interface SelectionsOptions {
  /**
   * Walk every combination of contexts across every modifier. Off by
   * default. The default walks the boot selection and each single-context
   * deviation from it. Those are the selections that the kit checks a build
   * against when the permutation space is too large.
   */
  exhaustive?: boolean;
}
