import type { Template, Parse, Assert } from "./types";

/**
 * Builds the {@link Parse} bundle: each tier asserts the value and returns it
 * narrowed to the tier type, or lets the {@link SchemaError} from {@link Assert}
 * propagate.
 */
export const defineParse = <T extends Template>(
  assert: Assert<T>,
): Parse<T> => {
  return {
    mode: (v: unknown) => {
      assert.mode(v);
      return v;
    },
    value: (v: unknown) => {
      assert.value(v);
      return v;
    },
    reference: (v: unknown) => {
      assert.reference(v);
      return v;
    },
    system: (v: unknown) => {
      assert.system(v);
      return v;
    },
    role: (v: unknown) => {
      assert.role(v);
      return v;
    },
    alias: (v: unknown) => {
      assert.alias(v);
      return v;
    },
    token: (v: unknown) => {
      assert.token(v);
      return v;
    },
    tokens: (v: unknown) => {
      assert.tokens(v);
      return v;
    },
    patch: (v: unknown) => {
      assert.patch(v);
      return v;
    },
    layer: (v: unknown) => {
      assert.layer(v);
      return v;
    },
    theme: (v: unknown) => {
      assert.theme(v);
      return v;
    },
  };
};
