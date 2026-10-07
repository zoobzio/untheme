/**
 * The error that {@link defineShikiTheme} throws for an invalid syntax
 * mapping. A mapping is invalid when it binds a role to a token that the
 * contract does not declare, or to a token whose type is not `color`. The
 * `problems` array lists every invalid binding.
 */
export class SyntaxMappingError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`invalid syntax mapping:\n  ${problems.join("\n  ")}`);
    this.name = "SyntaxMappingError";
    this.problems = problems;
  }
}
