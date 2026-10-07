import { describe, expect, it } from "vitest";

import { describe as describeTheme } from "@untheme/kit";

import { mockManifest, title } from "../src/manifest";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  tokens: { a: 1 },
  modifiers: {
    color: { light: {}, dark: {} },
    "text-size": { md: {}, lg: {} },
  },
});

describe("title", () => {
  it("capitalizes the words of an id", () => {
    expect(title("night_owl")).toBe("Night Owl");
    expect(title("text-size.large")).toBe("Text Size Large");
    expect(title("md")).toBe("Md");
  });
});

describe("mockManifest", () => {
  it("names every modifier and context by its titled id", () => {
    expect(mockManifest(theme)).toEqual([
      {
        id: "color",
        name: "Color",
        contexts: [
          { id: "light", name: "Light" },
          { id: "dark", name: "Dark" },
        ],
      },
      {
        id: "text-size",
        name: "Text Size",
        contexts: [
          { id: "md", name: "Md" },
          { id: "lg", name: "Lg" },
        ],
      },
    ]);
  });

  it("is what the kit describes for a theme built without documents", () => {
    expect(mockManifest(theme)).toEqual(describeTheme(theme));
  });

  it("carries the prose it is given, by modifier and by context", () => {
    const [color, text] = mockManifest(theme, {
      color: {
        name: "Color scheme",
        description: "Light or dark.",
        contexts: { dark: { name: "Dark", description: "Lights off." } },
      },
      "text-size": { contexts: { lg: { description: "" } } },
    });
    expect(color).toEqual({
      id: "color",
      name: "Color scheme",
      description: "Light or dark.",
      contexts: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark", description: "Lights off." },
      ],
    });
    expect(text?.contexts[1]).toEqual({ id: "lg", name: "Lg" });
  });
});
