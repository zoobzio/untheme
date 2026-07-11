/**
 * Terrazzo's beta token types with no standing in the DTCG format or in
 * untheme's schema. A document using one fails codegen by name rather than
 * silently dropping tokens.
 */
export const REJECTED_TYPES = new Set(["boolean", "string", "link"]);

/**
 * The default name of the emitted configuration file.
 */
export const FILENAME = "untheme.config.ts";

/**
 * A key that may appear unquoted in an object literal.
 */
export const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
