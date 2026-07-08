import type { Assert, Parse, Template } from "./types";

/**
 * Builds the {@link Parse} bundle: each kind asserts the value and returns it
 * narrowed to the kind type, or lets the {@link SchemaError} from
 * {@link Assert} propagate.
 */
export const defineParse = <T extends Template>(
  assert: Assert<T>,
): Parse<T> => {
  return {
    modifier: (v: unknown) => {
      assert.modifier(v);
      return v;
    },
    value: (v: unknown) => {
      assert.value(v);
      return v;
    },
    token: (v: unknown) => {
      assert.token(v);
      return v;
    },
    reference: (v: unknown) => {
      assert.reference(v);
      return v;
    },
    binding: (v: unknown) => {
      assert.binding(v);
      return v;
    },
    definition: (v: unknown) => {
      assert.definition(v);
      return v;
    },
    overrides: (v: unknown) => {
      assert.overrides(v);
      return v;
    },
    tokens: (v: unknown) => {
      assert.tokens(v);
      return v;
    },
    modifiers: (v: unknown) => {
      assert.modifiers(v);
      return v;
    },
    order: (v: unknown) => {
      assert.order(v);
      return v;
    },
    input: (v: unknown) => {
      assert.input(v);
      return v;
    },
    theme: (v: unknown) => {
      assert.theme(v);
      return v;
    },
    layer: (v: unknown) => {
      assert.layer(v);
      return v;
    },
    patch: (v: unknown) => {
      assert.patch(v);
      return v;
    },
  };
};
