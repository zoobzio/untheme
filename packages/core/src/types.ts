import type {
  Template,
  Mode,
  Tokens,
  Token,
  Theme,
  Schema,
  Layer,
  Patch,
} from "@untheme/schema";

/**
 * The mutable state container an {@link Untheme} service operates on. The
 * caller owns it: pass a plain object for inert state, or a reactive proxy to
 * have every service read and write tracked.
 */
export type Config<T extends Template> = {
  mode: Mode;
  theme: T;
};

/**
 * A runtime theme service providing token access, mutation, and mode toggling.
 */
export interface Untheme<T extends Template> {
  /**
   * The caller-owned state container — the single place state is read or
   * written raw.
   */
  config: Config<T>;

  /**
   * A set of theme layers that satisfy the token contract and are applicable to
   * the active theme.
   */
  themes: Record<string, Layer<T>>;

  /**
   * Guard vocabulary for the active theme's token contract.
   */
  schema: Schema<Theme<T>>;

  /**
   * Builds the flat token map for a mode (default: the active one), without
   * touching `config.mode`.
   */
  tokens: (mode?: Mode) => Tokens<T>;

  /**
   * Reads a token's current binding without resolving alias chains.
   */
  get: <K extends Token<T>>(token: K) => Tokens<T>[K];

  /**
   * Sets a single token, enforcing tier rules; invalid writes are no-ops.
   */
  set: <K extends Token<T>>(token: K, value: Tokens<T>[K]) => void;

  /**
   * Recursively resolves a token through its alias chain to a raw value;
   * throws `CircularAliasError` on a looping chain.
   */
  resolve: <K extends Token<T>>(token: K, chain?: Set<Token<T>>) => string;

  /**
   * Merges a patch of token overrides; theme identity is unchanged. Throws
   * `InvalidPatchError` when the patch steps outside the contract.
   */
  update: (patch: Patch<T>) => void;

  /**
   * Applies a layer: becomes that theme — the layer resolved against the
   * baseline — and caches the result as the id's pristine state. Throws
   * `InvalidLayerError` when the layer steps outside the contract.
   */
  apply: (layer: Layer<T>) => void;

  /**
   * Resolves a layer against the baseline into a complete theme; the active
   * theme is untouched. Throws `InvalidLayerError` when the layer steps
   * outside the contract.
   */
  create: (layer: Layer<T>) => Theme<T>;

  /**
   * Snapshots the active theme — including unsaved edits — as a detached
   * theme under a new identity.
   */
  extract: (id: string, name: string) => Theme<T>;

  /**
   * Whether any active binding deviates from the active theme's cached
   * pristine state.
   */
  dirty: () => boolean;

  /**
   * Restores the active theme to its cached pristine state, discarding edits
   * made since it was applied.
   */
  reset: () => void;
}
