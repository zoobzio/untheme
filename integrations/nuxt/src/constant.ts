/**
 * The filename of the base cascade template. The module writes it to the
 * build directory and links it into the CSS of the app.
 */
export const STYLESHEET = "untheme.css";

/**
 * The build-directory folder that holds the theme modules. These are the same
 * `index` and `config` modules that `untheme build` writes. The app imports
 * them as `#build/untheme/index.mjs` and `#build/untheme/config.mjs`.
 */
export const MODULES = "untheme";
