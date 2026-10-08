/**
 * Thrown when no config file exists at the path of the build. `path` holds the
 * path that the build checked.
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
 * Thrown when a config file loads but its default export is not a config.
 * `path` holds the path of the file.
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
 * Thrown when a config breaks a rule of the kit. Examples are a missing source,
 * an empty identity, an output directory outside the project root, and a
 * modifier or a context that the source does not declare. `issues` holds every
 * issue found. The kit checks the rules that need no document before it reads
 * any document. The kit checks the modifiers of the config against the source
 * after it reads the source.
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

/**
 * Thrown when a layer of the config violates the contract of the base theme.
 * Examples are a token that the base lacks, a `$type` other than the type of
 * the token in the contract, a reference to a token that the base lacks, and a
 * value outside the shape of the type. `issues` holds every issue of every
 * layer. Each issue names the layer and the token. The kit checks the layers
 * after it builds the base theme.
 */
export class InvalidLayerError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    const lines = issues.map((issue) => `  ${issue}`).join("\n");
    super(`@untheme/kit: the layers violate the contract —\n${lines}`);
    this.name = "InvalidLayerError";
    this.issues = issues;
  }
}
