import type { ParseOptions } from "@terrazzo/parser";
import type { Binding, Input, Layer, Schema, Template, Theme } from "untheme";

/**
 * The slice of a Terrazzo normalized token the conversion reads. Structural
 * on purpose: every `TokenNormalized` satisfies it, and tests can hand-build
 * minimal tokens without Terrazzo's full bookkeeping shape.
 */
export interface Source {
  $type: string;
  $value: unknown;
  $description?: string | undefined;
  $deprecated?: string | boolean | undefined;
  $extensions?: Record<string, unknown> | undefined;
  id: string;
  source?: { filename?: string | undefined } | undefined;
  originalValue?: unknown;
  aliasOf?: string | undefined;
  partialAliasOf?: unknown;
}

/**
 * A theme layer document to fold into the generated catalog: a plain DTCG
 * token document that rebinds a subset of the base contract's tokens.
 */
export interface ThemeSource {
  /**
   * The document location: an absolute URL, or a path resolved against the
   * generator's working directory (programmatic) or the first token source
   * (plugin).
   */
  source: string | URL;

  /**
   * The emitted layer's id; derived from the document filename when omitted.
   */
  id?: string;

  /**
   * The emitted layer's display name; falls back to the id when omitted.
   */
  name?: string;
}

/**
 * Options shared by both entry points: the identity the emitted base theme
 * carries, the theme documents to catalog, and the output filename.
 */
export interface SharedOptions {
  /**
   * The emitted base theme's id; derived from the resolver document's `name`
   * when omitted.
   */
  id?: string;

  /**
   * The emitted base theme's display name; falls back to the resolver
   * document's `name` when omitted.
   */
  name?: string;

  /**
   * The theme layer documents to parse and emit as the switchable catalog.
   */
  themes?: ThemeSource[];

  /**
   * The emitted filename; defaults to `untheme.config.ts`.
   */
  filename?: string;
}

/**
 * Options for the programmatic {@link generate} entry point, which owns
 * parsing and can therefore reach authenticated remote sources.
 */
export interface GenerateOptions extends SharedOptions {
  /**
   * The Terrazzo logger every parse reports through; defaults to Terrazzo's
   * own (warnings to stderr).
   */
  logger?: ParseOptions["logger"];

  /**
   * The root token or resolver document: an absolute URL, or a path resolved
   * against `cwd`.
   */
  source: string | URL;

  /**
   * Loader for every document the parse touches — the seam for authenticated
   * remote sources. Receives the document URL and the URL that referenced it;
   * returns the raw text. Falls back to the filesystem for `file:` URLs and
   * plain `fetch` for everything else.
   */
  req?: (src: URL, origin: URL) => Promise<string>;

  /**
   * The base URL relative paths resolve against; defaults to the process
   * working directory.
   */
  cwd?: URL;
}

/**
 * Options for the terrazzo plugin, which receives its sources already parsed
 * by the CLI. Authenticated sources need {@link GenerateOptions.req} via
 * `generate()` instead — the CLI's fetch carries no credentials.
 */
export type PluginOptions = SharedOptions;

/**
 * What {@link generate} returns: the emitted filename and the TypeScript
 * source text. The caller owns writing it to disk.
 */
export interface GenerateResult {
  filename: string;
  contents: string;
}

/**
 * The validated pieces of an untheme configuration, ready to serialize.
 */
export interface Assembled {
  base: Theme<Template>;
  themes: Record<string, Layer<Template>>;
  input: Input<Template>;
}

/**
 * The validated core of a generated config: the base theme narrowed through
 * untheme's own schema, the boot selection, the schema itself (for validating
 * catalog layers against the same contract), and the flat base bindings that
 * theme documents diff against.
 */
export interface Core {
  schema: Schema<Template>;
  theme: Theme<Template>;
  input: Input<Template>;
  flat: Record<string, Binding>;
}
