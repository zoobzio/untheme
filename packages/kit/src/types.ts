import type { Logger } from "@terrazzo/parser";
import type { Input, Layer, Template, Theme } from "@untheme/schema";

/**
 * What a config changes about one modifier of the resolver document. Each member
 * is optional.
 */
export interface ModifierConfig {
  /**
   * Contexts of the config's own, by name. Each context applies a token file or a
   * list of token files. Later files win. A source is a path relative to the
   * project root, an absolute URL, or an `npm:/` reference, like `source`. A
   * context can rebind only the tokens that the base defines.
   */
  add?: Record<string, string | URL | (string | URL)[]>;

  /**
   * The contexts that the build keeps, in the order that the contract lists them.
   * The theme and the types omit a context that the list omits, and the build
   * skips its files. Defaults to every context that the document declares,
   * then the added contexts.
   */
  contexts?: string[];

  /**
   * The context that the modifier boots at. The tokens of this context become the
   * base. Defaults to the default context of the document when the build keeps it.
   * Otherwise defaults to the first kept context.
   */
  default?: string;
}

/**
 * The authored `untheme.config.ts`. It sets where the DTCG resolver document
 * lives, the id and name of the base theme, what to keep of its modifiers, and
 * where the build writes.
 */
export interface KitConfig {
  /**
   * The resolver document or a plain token document. The value is a path relative
   * to the project root, an absolute URL, or an `npm:/` reference into an
   * installed package, for example `npm:/@untheme/aurora/src/resolver.json`.
   */
  source: string | URL;

  /**
   * Changes to the modifiers of the document, by modifier name. A modifier config
   * adds contexts, keeps contexts, and sets the boot context. The value `false`
   * turns the modifier off. The base keeps the default context of that modifier,
   * and the contract omits the modifier. The build uses the declaration of the
   * document for every other modifier.
   */
  modifiers?: Record<string, ModifierConfig | false>;

  /**
   * The layers of the build. A layer is a token document that rebinds tokens of
   * the base theme. The build checks each layer against the contract and writes
   * it as `layers/<id>.json`, ready for `apply`.
   *
   * A path or a `file:` URL names a local directory. Each `.json` file in the
   * directory is one layer, and its basename is the id. The build takes the
   * files in name order. The build does not list a package or a remote
   * directory.
   *
   * An object names the layers by layer id. Each value is a token file or a
   * list of token files. In a list, a later file wins. A file is a path
   * relative to the project root, an absolute URL, or an `npm:/` reference,
   * like `source`.
   */
  layers?: string | URL | Record<string, string | URL | (string | URL)[]>;

  /**
   * The base theme's id. Defaults to the slug of its name.
   */
  id?: string;

  /**
   * The display name of the base theme. Defaults to the `name` of the resolver
   * document. A plain token document requires this member.
   */
  name?: string;

  /**
   * The output directory, relative to the project root. Defaults to
   * `untheme`.
   */
  outDir?: string;
}

/**
 * The document loader that every parse reads through. The function receives a
 * document URL and the URL that referenced it. The function returns the raw
 * text.
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
   * The loader for every `file:` and remote document that the parse reads. Use it
   * for authenticated remote sources. Defaults to the filesystem for `file:` URLs
   * and to `fetch` for all other URLs. `npm:` URLs resolve from the packages of
   * the project.
   */
  req?: Req;

  /**
   * The Terrazzo logger that every parse reports through. Defaults to the logger
   * of Terrazzo, which writes warnings to stderr.
   */
  logger?: Logger;
}

/** Options for {@link build}. The type has the I/O hooks and the project location. */
export type BuildOptions = Omit<GenerateOptions, "cwd"> & {
  /** The project root. Defaults to `process.cwd()`. */
  root?: string;

  /** The config file, relative to `root`. Defaults to `untheme.config.ts`. */
  config?: string;
};

/** An interface entry for a modifier or one of its contexts. */
export interface Entry {
  /** The name of the modifier or context in the contract. */
  id: string;

  /** The display name. It is the name authored in the documents, or the titled id. */
  name: string;

  /** The description authored in the documents. */
  description?: string;
}

/**
 * The modifiers of a built theme as an interface presents them. The type has one
 * entry per modifier, in the order of the theme. Each entry has one entry per
 * kept context, in contract order.
 */
export type Manifest = (Entry & { contexts: Entry[] })[];

/**
 * One built layer. `layer` is the layer as `apply` takes it: an id, a name, and
 * the bindings of the tokens that the documents of the layer define. `entry`
 * has the id, the name, and the description of the layer for an interface.
 */
export interface BuiltLayer {
  /** The id, the name, and the description of the layer. */
  entry: Entry;

  /** The layer, checked against the contract of the base theme. */
  layer: Layer<Template>;
}

/**
 * The validated base of a build. It has the base theme that the kit reads from
 * the DTCG documents, the boot selection, and the manifest. The kit narrows the
 * theme with the untheme schema and verifies it against the Terrazzo resolution.
 * The emitters read this type.
 */
export interface Core {
  /** The base theme. It has every token, every modifier context, and the order. */
  theme: Theme<Template>;

  /** The boot selection: each modifier's default context. */
  input: Input<Template>;

  /**
   * The modifiers and their contexts, with names and descriptions. A consumer that
   * holds only a built theme and selection can omit it. The emitters then derive a
   * manifest from the theme. Each name is the titled id.
   */
  manifest?: Manifest;

  /**
   * The layers of the build, in the order of the config. A consumer that has no
   * layers can omit it. The emitters then write an empty layer list.
   */
  layers?: BuiltLayer[];
}

/**
 * A resolved config. It has the {@link Core} of the build, the output directory,
 * and the documents that the build read. {@link resolveKit} returns it. A
 * consumer that works with documents, such as a framework module, uses this
 * form.
 */
export interface Kit extends Core {
  /** The modifiers and their contexts, with names and descriptions. */
  manifest: Manifest;

  /** The layers of the build, in the order of the config. */
  layers: BuiltLayer[];

  /** The output directory, normalized and relative to the project root. */
  outDir: string;

  /**
   * The absolute path of each local document that the build read, with the
   * resolver first, and of the layers directory when the config names one. A
   * dev server watches these paths to rebuild on change.
   */
  documents: string[];
}

/** One emitted file. `path` is relative to the output directory. */
export interface OutputFile {
  path: string;
  contents: string;
}

/**
 * What {@link generate} returns. `files` holds the files to write under
 * `outDir`.
 */
export interface Output {
  outDir: string;
  files: OutputFile[];
}

/**
 * The slice of a Terrazzo normalized token that the conversion reads. Every
 * `TokenNormalized` satisfies it. A test can build a minimal token of this
 * type.
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
