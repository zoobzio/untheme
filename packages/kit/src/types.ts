import type { Logger } from "@terrazzo/parser";
import type { Input, Template, Theme } from "@untheme/schema";

/**
 * The authored `untheme.config.ts`: where the DTCG resolver document lives,
 * the identity to give the base theme, and where the build writes.
 */
export interface KitConfig {
  /**
   * The resolver document (or a plain token document): a path relative to the
   * project root, an absolute URL, or an `npm:/` reference into an installed
   * package (`npm:/@untheme/aurora/themes/aurora/resolver.json`).
   */
  source: string | URL;

  /**
   * The base theme's id. Defaults to the slug of its name.
   */
  id?: string;

  /**
   * The base theme's display name. Defaults to the resolver document's
   * `name`; required when the source is a plain token document.
   */
  name?: string;

  /**
   * The output directory, relative to the project root. Defaults to
   * `untheme`.
   */
  outDir?: string;
}

/**
 * The document loader every parse reads through: receives a document URL and
 * the URL that referenced it, and returns the raw text.
 */
export type Req = (src: URL, origin: URL) => Promise<string>;

/**
 * The I/O hooks of a build.
 */
export interface GenerateOptions {
  /**
   * The project root: relative sources resolve against it, and `npm:/`
   * references resolve from its packages. Defaults to `process.cwd()`.
   */
  cwd?: string;

  /**
   * Loader for every `file:` and remote document the parse touches — the seam
   * for authenticated remote sources. Falls back to the filesystem for
   * `file:` URLs and plain `fetch` for everything else. `npm:` URLs never
   * reach it: they always resolve from the project's packages.
   */
  req?: Req;

  /**
   * The Terrazzo logger every parse reports through; defaults to Terrazzo's
   * own (warnings to stderr).
   */
  logger?: Logger;
}

/** Options for {@link build}: the I/O hooks plus where the project lives. */
export type BuildOptions = Omit<GenerateOptions, "cwd"> & {
  /** The project root; defaults to `process.cwd()`. */
  root?: string;

  /** The config file, relative to `root`; defaults to `untheme.config.ts`. */
  config?: string;
};

/**
 * The validated base of a build: the base theme read off the DTCG documents,
 * narrowed through untheme's own schema and proven against Terrazzo's own
 * resolution, and the boot selection. What the emitters read.
 */
export interface Core {
  /** The base theme: every token, every modifier context, the order. */
  theme: Theme<Template>;

  /** The boot selection: each modifier's default context. */
  input: Input<Template>;
}

/**
 * A config resolved: the {@link Core} of the build, plus where it writes and
 * what it read. What {@link resolveKit} returns — the in-memory form a
 * consumer that wants documents rather than files (a framework module) works
 * from.
 */
export interface Kit extends Core {
  /** The output directory, normalized and relative to the project root. */
  outDir: string;

  /**
   * The absolute path of every local document the build read, the resolver
   * first — what a dev server watches to rebuild on change.
   */
  documents: string[];
}

/** One emitted file, its path relative to the output directory. */
export interface OutputFile {
  path: string;
  contents: string;
}

/**
 * What {@link generate} returns: the files to write under `outDir`. No
 * filesystem writes — the caller owns I/O.
 */
export interface Output {
  outDir: string;
  files: OutputFile[];
}

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
