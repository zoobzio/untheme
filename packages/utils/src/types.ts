import type {
  Context,
  Modifier,
  Overrides,
  SharedBinding,
  Authored,
  Template,
} from "@untheme/schema";

/**
 * A contract extension for {@link extend}: new tokens (`XTok`) and new modifiers
 * (`XMod`), plus optional overrides of the base's tokens and of its existing
 * modifier contexts.
 *
 * An existing base token accepts an optional bare binding — a value or a
 * `{reference}` that rebinds its `$value` only, never its `$type`. A new token
 * requires a full {@link Authored} definition. Every value position draws its
 * reference suggestions from the union of the base tokens and the extension's
 * own new tokens, so a binding may reference either set.
 *
 * `Tok` is inferred from the base contract and `XTok` from the new-token keys
 * alone; the reference arm of every {@link SharedBinding} carries `NoInfer`, so
 * a reference sitting in a value position never drives inference and never
 * collapses the token union.
 *
 * `XTok` infers as every key present in `tokens`, base overrides included, since
 * a mapped type cannot subtract the known `Tok` keys during inference. The
 * `K extends Tok` guard routes those leaked base keys back to a bare binding, so
 * only genuinely new keys demand a full definition. The arm stays optional: a
 * required arm stops `XTok` from inferring when `tokens` is empty, and the
 * fallback to `string` disables every token-name check.
 *
 * `modifiers` admits overrides of an existing axis's contexts and new axes
 * carrying their complete context maps.
 */
export type Extension<
  Tok extends string,
  Mod extends Record<string, Record<string, object>>,
  XTok extends string,
  XMod extends Record<string, Record<string, object>>,
> = {
  id: string;
  name: string;
  tokens: {
    [K in NoInfer<Tok>]?: SharedBinding<Tok | XTok>;
  } & {
    [K in XTok]?: K extends Tok
      ? SharedBinding<Tok | XTok>
      : Authored<Tok | XTok>;
  };
  modifiers: {
    [M in keyof Mod]?: {
      [C in keyof Mod[M]]?: {
        [K in NoInfer<Tok | XTok>]?: SharedBinding<Tok | XTok>;
      };
    };
  } & {
    [M in keyof XMod]: {
      [C in keyof XMod[M]]: {
        [K in NoInfer<Tok | XTok>]?: SharedBinding<Tok | XTok>;
      };
    };
  };
  order: ((keyof Mod | keyof XMod) & (string & {}))[];
};

/**
 * The deviation between two themes, as produced by {@link diff}: a token
 * override map and per-modifier, per-context override maps, all present (empty
 * when nothing deviates) so consumers can inspect them without guards.
 */
export type Diff<T extends Template> = {
  tokens: Overrides<T>;
  modifiers: { [M in Modifier<T>]: { [C in Context<T, M>]: Overrides<T> } };
};

/**
 * A partial overlay of a theme: any subset of identity, tokens, modifiers, and
 * order. Both a `Layer` (identity plus partial overrides) and a `Patch`
 * (anonymous overrides) fit this shape, so one merge serves them all.
 */
export type Overlay<T extends Template> = {
  id?: string;
  name?: string;
  tokens?: Overrides<T>;
  modifiers?: { [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> } };
  order?: NoInfer<Modifier<T>>[];
};
