/**
 * The filename of the static cascade template the module writes into the
 * build directory — the base bindings and every modifier context as plain
 * CSS, importable from app stylesheets as `#build/untheme.css`.
 */
export const STYLESHEET = "untheme.css";

/**
 * The build-directory folder the module writes the theme modules into — the
 * same `index` and `config` modules `untheme build` writes to its output
 * directory, importable in the app as `#build/untheme/index.mjs` and
 * `#build/untheme/config.mjs`.
 */
export const MODULES = "untheme";
