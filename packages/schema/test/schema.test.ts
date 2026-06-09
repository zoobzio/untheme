import { describe, it, expect } from "vitest";
import { createUnthemeSchema } from "../src/schema";
import { cssType } from "../src/css";

const schema = createUnthemeSchema({
  ref: ["bg", "accent-9", "radius-1", "duration", "font", "shadow"],
  sys: ["surface", "solid", "text"],
  role: ["brand", "danger"],
});

const reference = {
  bg: "#ffffff",
  "accent-9": "#0090ff",
  "radius-1": "3px",
  duration: "250ms",
  font: "Roboto, sans-serif",
  shadow: "0 1px 2px rgb(0 0 0 / 8%)",
};

const modes = {
  light: { surface: "bg", solid: "accent-9", text: "accent-9" },
  dark: { surface: "accent-9", solid: "accent-9", text: "bg" },
};

const roles = { brand: "accent-9", danger: "text" };

/** A complete theme. */
const theme = {
  preset: "demo",
  key: "demo",
  label: "Demo",
  reference,
  modes,
  roles,
};
/** A theme layer: identity + tokens, no roles. */
const layer = { preset: "demo", key: "demo", label: "Demo", reference, modes };

describe("token enums", () => {
  it("ref accepts reference names, rejects others", () => {
    expect(schema.ref.safeParse("accent-9").success).toBe(true);
    expect(schema.ref.safeParse("surface").success).toBe(false);
  });

  it("sys accepts system names, rejects others", () => {
    expect(schema.sys.safeParse("solid").success).toBe(true);
    expect(schema.sys.safeParse("accent-9").success).toBe(false);
  });

  it("role accepts role names, rejects others", () => {
    expect(schema.role.safeParse("brand").success).toBe(true);
    expect(schema.role.safeParse("solid").success).toBe(false);
  });
});

describe("cssType helper", () => {
  it("validates against a single CSS type", () => {
    const color = cssType("color");
    expect(color.safeParse("#0090ff").success).toBe(true);
    expect(color.safeParse("rgb(0 144 255)").success).toBe(true);
    expect(color.safeParse("#ggg").success).toBe(false);
    expect(color.safeParse("16px").success).toBe(false);
  });

  it("fails rather than throws for an unknown css type name", () => {
    // css-tree throws "Bad syntax reference" for an unrecognized type; the
    // helper must catch it and report invalid instead of propagating.
    const bogus = cssType("notarealtype");
    expect(bogus.safeParse("anything").success).toBe(false);
  });
});

describe("theme schema (complete)", () => {
  it("parses a complete theme", () => {
    expect(schema.theme.safeParse(theme).success).toBe(true);
  });

  it("requires roles (a layer is not a complete theme)", () => {
    expect(schema.theme.safeParse(layer).success).toBe(false);
  });

  it("requires every reference key", () => {
    const missing = { ...reference };
    Reflect.deleteProperty(missing, "bg");
    expect(
      schema.theme.safeParse({ ...theme, reference: missing }).success,
    ).toBe(false);
  });

  it("validates reference values as CSS", () => {
    expect(
      schema.theme.safeParse({
        ...theme,
        reference: { ...reference, bg: "#ggg" },
      }).success,
    ).toBe(false);
  });

  it("rejects a system token aliasing a non-reference value", () => {
    expect(
      schema.theme.safeParse({
        ...theme,
        modes: { ...modes, light: { ...modes.light, surface: "ghost" } },
      }).success,
    ).toBe(false);
  });

  it("requires every system token in each mode", () => {
    expect(
      schema.theme.safeParse({
        ...theme,
        modes: { ...modes, light: { surface: "bg", solid: "accent-9" } },
      }).success,
    ).toBe(false);
  });

  it("accepts role values aliasing reference or system tokens", () => {
    expect(
      schema.theme.safeParse({
        ...theme,
        roles: { brand: "accent-9", danger: "solid" },
      }).success,
    ).toBe(true);
  });

  it("rejects role values that alias nothing", () => {
    expect(
      schema.theme.safeParse({
        ...theme,
        roles: { brand: "ghost", danger: "text" },
      }).success,
    ).toBe(false);
  });

  it("requires every role key", () => {
    expect(
      schema.theme.safeParse({ ...theme, roles: { brand: "accent-9" } })
        .success,
    ).toBe(false);
  });
});

describe("partial schema (layer)", () => {
  it("accepts a complete theme", () => {
    expect(schema.partial.safeParse(theme).success).toBe(true);
  });

  it("accepts a layer with no roles", () => {
    expect(schema.partial.safeParse(layer).success).toBe(true);
  });

  it("accepts a subset of reference and system tokens", () => {
    expect(
      schema.partial.safeParse({
        preset: "demo",
        key: "demo",
        label: "Demo",
        reference: { bg: "#ffffff" },
        modes: { light: { surface: "bg" }, dark: {} },
      }).success,
    ).toBe(true);
  });

  it("rejects unknown reference keys", () => {
    expect(
      schema.partial.safeParse({
        ...layer,
        reference: { ...reference, ghost: "#000" },
      }).success,
    ).toBe(false);
  });

  it("rejects invalid CSS values", () => {
    expect(
      schema.partial.safeParse({
        ...layer,
        reference: { ...reference, bg: "#ggg" },
      }).success,
    ).toBe(false);
  });

  it("rejects a system token aliasing a non-reference value", () => {
    expect(
      schema.partial.safeParse({
        ...layer,
        modes: { light: { surface: "ghost" }, dark: {} },
      }).success,
    ).toBe(false);
  });

  it("accepts a token subset that the complete theme schema rejects", () => {
    const subset = {
      preset: "demo",
      key: "demo",
      label: "Demo",
      reference: { bg: "#ffffff" },
      modes: { light: { surface: "bg" }, dark: {} },
    };
    expect(schema.partial.safeParse(subset).success).toBe(true);
    expect(schema.theme.safeParse(subset).success).toBe(false);
  });
});
