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

/**
 * The base route of the theme catalog that the module serves when the build
 * has layers. The `route` option changes it. The handler answers
 * `GET <route>/themes` and `GET <route>/themes/<id>`.
 */
export const ROUTE = "/api/untheme";

/**
 * The server template that holds the entries and the layers of the build. The
 * catalog handler imports it.
 */
export const LAYERS = "#untheme/layers.mjs";
