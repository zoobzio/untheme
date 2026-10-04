/**
 * Raised when there is no config file at the path the build was pointed at.
 * Carries the `path` it looked for.
 */
export class MissingConfigError extends Error {
  readonly path: string;

  constructor(path: string) {
    super(`@untheme/kit: no config file at ${path}`);
    this.name = "MissingConfigError";
    this.path = path;
  }
}

/**
 * Raised when a config file does not default-export a config — the file
 * loaded, but what it exports is not config-shaped. Carries the `path` of the
 * file.
 */
export class MalformedConfigError extends Error {
  readonly path: string;

  constructor(path: string) {
    super(
      `@untheme/kit: ${path} must default-export a config (defineConfig({ source }))`,
    );
    this.name = "MalformedConfigError";
    this.path = path;
  }
}

/**
 * Raised when a config breaks the kit's rules — a missing source, an empty
 * identity, an output directory outside the project root, a modifier or a
 * context the source does not declare. Carries every issue found, not just
 * the first. Everything that can be decided without the documents is thrown
 * before any is read; what a config says about modifiers is checked against
 * the source once it is.
 */
export class InvalidConfigError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    const lines = issues.map((issue) => `  ${issue}`).join("\n");
    super(`@untheme/kit: the config is invalid —\n${lines}`);
    this.name = "InvalidConfigError";
    this.issues = issues;
  }
}
