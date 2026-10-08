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
