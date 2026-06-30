/**
 * Sequences that let a value escape its CSS declaration (statements, blocks,
 * comments, tag closers, escapes) or fetch a resource (`url()`).
 */
export const CSS_BREAKOUT = /[;{}\\]|\/\*|<\/|\burl\(/i;
