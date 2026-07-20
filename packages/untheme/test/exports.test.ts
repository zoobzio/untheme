import { describe, expect, it } from "vitest";

import * as catalog from "@untheme/catalog";
import * as core from "@untheme/core";
import * as css from "@untheme/css";
import * as kit from "@untheme/kit";
import * as schema from "@untheme/schema";
import * as utils from "@untheme/utils";

import * as root from "../src/index";
import * as catalogSubpath from "../src/catalog";
import * as configSubpath from "../src/config";
import * as cssSubpath from "../src/css";
import * as kitSubpath from "../src/kit";

/* ESM silently drops a name exported by more than one module in an
   `export *` set; these guards fail loudly instead. */
describe("star-export composition", () => {
  const sources = { core, schema, utils };

  it("keeps the composed packages' runtime exports disjoint", () => {
    const seen = new Map<string, string>();
    for (const [pkg, namespace] of Object.entries(sources)) {
      for (const name of Object.keys(namespace)) {
        expect.soft(seen.get(name), `${name} from ${pkg}`).toBeUndefined();
        seen.set(name, pkg);
      }
    }
  });

  it("re-exports every runtime export of each composed package", () => {
    for (const namespace of Object.values(sources)) {
      for (const name of Object.keys(namespace)) {
        expect.soft(root, name).toHaveProperty(name);
      }
    }
  });

  it("mirrors catalog, css, and kit under their subpaths", () => {
    for (const name of Object.keys(catalog)) {
      expect.soft(catalogSubpath, name).toHaveProperty(name);
    }
    for (const name of Object.keys(css)) {
      expect.soft(cssSubpath, name).toHaveProperty(name);
    }
    for (const name of Object.keys(kit)) {
      expect.soft(kitSubpath, name).toHaveProperty(name);
    }
  });

  it("exposes the canonical config helpers under their subpath", () => {
    expect(configSubpath).toHaveProperty("defineUnthemeConfig");
    expect(configSubpath).toHaveProperty("useUnthemeConfig");
  });
});
