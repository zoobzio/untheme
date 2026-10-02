/**
 * A theme file: a DTCG token document with flat token names.
 */
export type ThemeFile = Record<string, { $type?: string; $value: unknown }>;

/**
 * The lazy import of one theme file.
 */
export type Loader = () => Promise<{ default: ThemeFile }>;
