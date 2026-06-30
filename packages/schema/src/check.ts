import type { Check, Domain, Kind, Rule, Rules, Template } from "./types";

/**
 * Builds the {@link Check} bundle: one boolean type predicate per kind. A kind
 * passes when every rule in its list returns no issue.
 */
export const defineCheck = <T extends Template>({
  rules,
}: Rules<T>): Check<T> => {
  const check =
    <K extends Kind>(list: Rule[]) =>
    (v: unknown): v is Domain<T>[K] =>
      list.every((rule) => rule(v) === undefined);
  return {
    modifier: check<"modifier">(rules.modifier),
    value: check<"value">(rules.value),
    token: check<"token">(rules.token),
    reference: check<"reference">(rules.reference),
    binding: check<"binding">(rules.binding),
    overrides: check<"overrides">(rules.overrides),
    tokens: check<"tokens">(rules.tokens),
    modifiers: check<"modifiers">(rules.modifiers),
    order: check<"order">(rules.order),
    input: check<"input">(rules.input),
    theme: check<"theme">(rules.theme),
    layer: check<"layer">(rules.layer),
    patch: check<"patch">(rules.patch),
  };
};
