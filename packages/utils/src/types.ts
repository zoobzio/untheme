import type {
  Context,
  Modifier,
  Overrides,
  Template,
  Value,
} from "@untheme/schema";

/**
 * A contract extension for {@link extend}: new tokens (`XTok`) and new modifiers
 * (`XMod`), plus optional overrides of the base's tokens and of its existing
 * modifier contexts. New bindings may reference base or extension tokens.
 */
export type Extension<
  Tok extends string,
  Mod extends Record<string, Record<string, Partial<Record<string, string>>>>,
  XTok extends string,
  XMod extends Record<string, Record<string, Partial<Record<string, string>>>>,
> = {
  id: string;
  name: string;
  tokens: {
    [K in Tok]?: `{${NoInfer<Tok | XTok>}` | Value;
  } & {
    [K in XTok]: `{${NoInfer<XTok>}` | Value;
  };
  modifiers: {
    [M in keyof Mod]?: {
      [C in keyof Mod[M]]?: {
        [K in NoInfer<Tok | XTok>]?: `{${NoInfer<Tok | XTok>}}` | Value;
      };
    };
  } & {
    [M in keyof XMod]: {
      [C in keyof XMod[M]]: {
        [K in NoInfer<Tok | XTok>]?: `{${NoInfer<Tok | XTok>}}` | Value;
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
