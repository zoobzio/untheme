import type { Template, Guard, Domain, Rule, Tier, Lexicon } from "./types";

/**
 * Builds the {@link Guard} bundle: one boolean type predicate per tier. A tier
 * passes when every rule in `lexicon.rules[tier]` returns no issue.
 */
export const defineGuard = <T extends Template>(
  lexicon: Lexicon<T>,
): Guard<T> => {
  const guard =
    <K extends Tier>(_tier: K, rules: Rule[]) =>
    (v: unknown): v is Domain<T>[K] => {
      return rules.every((rule) => rule(v) === undefined);
    };
  return {
    mode: guard("mode", lexicon.rules.mode),
    value: guard("value", lexicon.rules.value),
    reference: guard("reference", lexicon.rules.reference),
    system: guard("system", lexicon.rules.system),
    role: guard("role", lexicon.rules.role),
    alias: guard("alias", lexicon.rules.alias),
    token: guard("token", lexicon.rules.token),
    tokens: guard("tokens", lexicon.rules.tokens),
    patch: guard("patch", lexicon.rules.patch),
    layer: guard("layer", lexicon.rules.layer),
    theme: guard("theme", lexicon.rules.theme),
  };
};
