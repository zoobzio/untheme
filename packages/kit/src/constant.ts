/**
 * The config file that the CLI reads from the project root when `--config` is
 * absent.
 */
export const FILENAME = "untheme.config.ts";

/**
 * The default output directory, relative to the project root.
 */
export const OUT_DIR = "untheme";

/**
 * The manifest file that a write puts in the output directory. It lists the
 * paths that the write produced. The next write removes each listed path that
 * its output omits.
 */
export const MANIFEST = ".untheme.json";

/**
 * The key under `$extensions` that untheme reads. `{ "name": "Display name" }`
 * on a modifier, or at the root of the token file of a context, sets its display
 * name in the manifest.
 */
export const EXTENSION = "io.zoobz.untheme";

/**
 * The protocol of a source in an installed package, for example
 * `npm:/@scope/pkg/file.json`. The slash after the colon is required. It makes
 * the URL hierarchical, and relative `$ref`s inside the package resolve against
 * it.
 */
export const NPM = "npm:";

/**
 * The Terrazzo beta token types that are outside the DTCG format and the untheme
 * schema. A document that uses one fails the build. The error names the type and
 * the token.
 */
export const REJECTED_TYPES = new Set(["boolean", "string", "link"]);
