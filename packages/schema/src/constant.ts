/**
 * The color modes every system token must be defined for.
 */
export const COLOR_MODES = ["light", "dark"] as const;

/**
 * Sequences that let a value escape its declaration (statements, blocks,
 * comments, tag closers, escapes) or fetch a resource (url()).
 */
export const CSS_BREAKOUT = /[;{}\\]|\/\*|<\/|\burl\(/i;

/**
 * Available keys on a theme template.
 */
export const SECTIONS = ["id", "name", "reference", "system", "roles"] as const;
