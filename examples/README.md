# Examples

The theme example is a package: a palette of its own over the [aurora](../presets/aurora) preset, built with [`@untheme/kit`](../packages/kit) into a preset of its own. The other examples take it as their preset. One names it in the Nuxt module. Two import its config module and map its `syntax-*` tokens to a highlighter. Each uses the [`untheme`](../packages/untheme) package and an integration from [`../integrations`](../integrations).

Each example has a test suite that uses [`@untheme/testing`](../packages/testing). The app examples check their logic against a mock theme with a few tokens, and build no preset. The theme example builds itself and checks the build.

| Example                    | Directory             | Description                                                                                                    |
| -------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| [theme](./theme)           | `examples/theme`      | Mantis: a palette and a `syntax-*` group over aurora, with every aurora theme as a layer, as a preset package. |
| [codemirror](./codemirror) | `examples/codemirror` | A CodeMirror 6 editor that uses the tokens as its theme. It has a light and dark toggle.                       |
| [nuxt](./nuxt)             | `examples/nuxt`       | A Nuxt landing page. The page changes style when you pick a theme.                                             |
| [shiki](./shiki)           | `examples/shiki`      | A static page with a Shiki theme from the `syntax-*` tokens. It has a light and dark toggle.                   |
