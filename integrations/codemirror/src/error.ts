/**
 * The error that `defineCodeMirrorTheme` throws for an invalid highlight
 * mapping. A mapping is invalid when it binds a role to a token that the
 * contract does not declare, or to a token whose type is not `color`. The
 * `problems` array lists every invalid binding.
 */
export class SyntaxMappingError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`invalid highlight mapping:\n  ${problems.join("\n  ")}`);
    this.name = "SyntaxMappingError";
    this.problems = problems;
  }
}
