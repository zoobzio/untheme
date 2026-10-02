/**
 * The config file the CLI looks for in the project root when `--config` is not
 * given.
 */
export const FILENAME = "untheme.config.ts";

/**
 * The default output directory, relative to the project root.
 */
export const OUT_DIR = "untheme";

/**
 * The manifest a write leaves in the output directory: the paths it produced,
 * so the next write can remove the ones it no longer does without touching
 * anything the kit did not write.
 */
export const MANIFEST = ".untheme.json";

/**
 * The protocol of a source that lives in an installed package:
 * `npm:/@scope/pkg/file.json`. The slash after the colon is required — it
 * makes the URL hierarchical, so relative `$ref`s inside the package resolve
 * against it.
 */
export const NPM = "npm:";

/**
 * Terrazzo's beta token types with no standing in the DTCG format or in
 * untheme's schema. A document using one fails the build by name rather than
 * silently dropping tokens.
 */
export const REJECTED_TYPES = new Set(["boolean", "string", "link"]);
