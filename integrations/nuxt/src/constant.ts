/**
 * The filename of the static cascade template. The module writes it to the
 * build directory and does not link it. An app stylesheet can import it as
 * `#build/untheme.css`.
 */
export const STYLESHEET = "untheme.css";

/**
 * The build-directory folder that holds the theme modules. These are the same
 * `index` and `config` modules that `untheme build` writes. The app imports
 * them as `#build/untheme/index.mjs` and `#build/untheme/config.mjs`.
 */
export const MODULES = "untheme";

/** The default base route of the theme catalog. The `route` option changes it. */
export const ROUTE = "/api/theme";

/**
 * The base name of the server assets that hold the catalog: `layers.json` and
 * `layers/<id>.json` of the `untheme/` build directory.
 */
export const ASSETS = "untheme";

/** The entries file of the catalog, in the `untheme/` build directory. */
export const ENTRIES = "layers.json";
