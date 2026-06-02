import { describe, it, expectTypeOf } from "vitest";
import type {
  ThemeTemplate,
  ThemeMode,
  RefToken,
  SysToken,
  RoleToken,
  Theme,
} from "../src/types";

interface TestTemplate extends ThemeTemplate {
  label: "test";
  reference: { white: "#ffffff"; black: "#000000" };
  modes: {
    light: { background: "white"; foreground: "black" };
    dark: { background: "black"; foreground: "white" };
  };
  roles: { primary: "foreground" };
}

describe("ThemeMode", () => {
  it("is a union of light and dark", () => {
    expectTypeOf<ThemeMode>().toEqualTypeOf<"light" | "dark">();
  });
});

describe("RefToken", () => {
  it("extracts reference token keys", () => {
    expectTypeOf<RefToken<TestTemplate>>().toEqualTypeOf<
      "white" | "black"
    >();
  });
});

describe("SysToken", () => {
  it("extracts system token keys from light mode", () => {
    expectTypeOf<SysToken<TestTemplate>>().toEqualTypeOf<
      "background" | "foreground"
    >();
  });
});

describe("RoleToken", () => {
  it("extracts role token keys", () => {
    expectTypeOf<RoleToken<TestTemplate>>().toEqualTypeOf<"primary">();
  });
});

describe("Theme", () => {
  type T = Theme<TestTemplate>;

  it("has a string label", () => {
    expectTypeOf<T["label"]>().toEqualTypeOf<string>();
  });

  it("maps reference tokens to strings", () => {
    expectTypeOf<T["reference"]>().toEqualTypeOf<{
      white: string;
      black: string;
    }>();
  });

  it("maps system tokens to reference tokens per mode", () => {
    expectTypeOf<T["modes"]["light"]>().toEqualTypeOf<{
      background: "white" | "black";
      foreground: "white" | "black";
    }>();
  });

  it("maps role tokens to reference or system tokens", () => {
    expectTypeOf<T["roles"]>().toEqualTypeOf<{
      primary: "white" | "black" | "background" | "foreground";
    }>();
  });
});
