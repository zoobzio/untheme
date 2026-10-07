# @untheme/testing

Test helpers and mocks for code that uses untheme. The package builds a theme
from a terse spec, boots a service over the theme, and mocks the output of
[`@untheme/kit`](../kit). A test suite runs without DTCG JSON, without a kit
build, and without Terrazzo.

A kit build is correct at build time and slow in a test. A build of a preset
the size of [aurora](../../presets/aurora) takes seconds. Most tests of an app,
a framework module, or a syntax theme use a few tokens. The helpers make those
tokens a few lines. The schema checks the result the same way it checks a
build.

## Usage

```ts
import { bootUntheme, mockTheme } from "@untheme/testing";

const theme = mockTheme({
  tokens: {
    white: "#fff",
    black: "#000",
    surface: "{white}",
    "on-surface": "{black}",
    gap: "8px",
  },
  modifiers: {
    color: { light: {}, dark: { surface: "{black}", "on-surface": "{white}" } },
    density: { default: {}, compact: { gap: "4px" } },
  },
});

const untheme = bootUntheme(theme, { color: "dark" });

untheme.resolve("surface"); // the structured black
untheme.swap("density", "compact");
untheme.get("gap"); // { value: 4, unit: "px" }
```

The theme is typed as a `Contract` over the token and modifier names of the
spec. `resolve`, `swap`, and every other call autocomplete the names, the same
way a `Contract` from the kit does.

## Terse values

Each token is one of these forms.

| Form                    | Token type             | Example                                      |
| ----------------------- | ---------------------- | -------------------------------------------- |
| hex string              | `color`                | `"#3b82f6"`, `"#fff"`, `"#00000080"` (alpha) |
| number and `px` / `rem` | `dimension`            | `"8px"`, `"1.5rem"`                          |
| number and `ms` / `s`   | `duration`             | `"200ms"`, `"1s"`                            |
| number                  | `number`               | `1.5`                                        |
| `{reference}`           | the type of the target | `"{blue}"`                                   |
| `{ $type, $value }`     | as declared            | `{ $type: "fontFamily", $value: "Inter" }`   |

A reference has the type of the token that it names, through any chain of
references. `primary: "{blue}"` is a color when `blue` is a color. A modifier
context rebinds tokens with the same forms, minus the full definition. A
context never restates a type. Every other value needs the full definition.

The schema checks the theme before `mockTheme` returns it. A reference to a
missing token, an override of the wrong type, or an override of a token that
the spec lacks fails in `mockTheme` with the issues of the schema. It does not
fail in the test that uses the theme.

## Helpers

- `mockTheme(spec)` builds a complete theme from a terse spec.
- `mockInput(theme, selection?)` returns a boot selection. Each modifier is at
  its first context, unless the selection pins another.
- `bootUntheme(theme, selection?, options?)` boots a service over a fresh
  container with a detached clone of the theme. Every call is independent.
  The swaps and edits of one test do not reach another test.
- `mockManifest(theme, prose?)` returns the manifest that the kit emits.
  Every name is the titled id unless `prose` sets another.
- `mockModules(theme, options?)` returns the `index`, `config`, and
  `manifest` modules that `untheme build` writes, as module namespaces.
  `mockIndex` and `mockConfig` return one module each.
- `mockKit(theme, options?)` returns the kit that `resolveKit` returns.
  `stubKit(kit, config?)` returns `loadConfig` and `resolveKit` stubs that
  answer with it.
- `mockProvider(layers)` and `mockCatalog(schema, layers)` serve layers from
  memory. They follow the search, the sort, and the window of a listing.
- `selections(theme, options?)` lists the selections to check a theme at.
  `resolveAll(untheme, selection?)` resolves every token into one record.
  `proveTheme(theme, options?)` checks the schema, boots a service, and
  resolves every token at every selection.

## Mock a build

An app imports the modules that `untheme build` wrote to `untheme/`. A test
mocks them with the same shapes over a mock theme.

```ts
import { mockModules, mockTheme } from "@untheme/testing";

const theme = mockTheme({/* ... */});
const modules = mockModules(theme, { selection: { color: "dark" } });

vi.mock("../untheme/config.mjs", () => modules.config);
vi.mock("../untheme/manifest.mjs", () => modules.manifest);
```

`vi.mock` is hoisted above the imports of the file. A factory that needs a
fixture imports the fixture itself:
`async () => (await import("./fixtures")).modules.config`.

A framework module builds through the kit at build time. The tests of the
module stub the two members that read the filesystem. The rest of the kit stays
real.

```ts
import { mockKit, mockTheme, stubKit } from "@untheme/testing";

const kit = mockKit(mockTheme({/* ... */}), {
  documents: ["/app/tokens/resolver.json"],
});

vi.mock("@untheme/kit", async (original) => ({
  ...(await original<typeof import("@untheme/kit")>()),
  ...stubKit(kit),
}));
```

## Check a theme

A theme built by hand, or the tokens of a preset read in as JSON, has one test
to pass before any other test uses it.

```ts
import { proveTheme } from "@untheme/testing";

it("is sound", () => {
  proveTheme(theme);
});
```

`proveTheme` checks the schema, boots a service, and resolves every token at
the boot selection and at each single-context deviation from it. Those are the
selections that the kit checks a build against. `{ exhaustive: true }` walks
every combination of contexts instead. At preset scale that is tens of
thousands, so use it only where the axes interact.

## Type an interchange

A syntax map or a chrome binding is typed against the real contract of the
app. The token union of the real contract is much wider than the union of a
mock. Declare the map `as const satisfies` the type, and the literal token
names survive. The same constant then type-checks against a mock contract that
defines only those tokens.

```ts
export const MAP = {
  keyword: "syntax-keyword",
  string: "syntax-string",
} as const satisfies SyntaxMap<Contract>;
```

The [shiki](../../examples/shiki) and [codemirror](../../examples/codemirror)
examples test their maps this way.
