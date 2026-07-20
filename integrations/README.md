# Integrations

Bridges between untheme and host frameworks. Each integration depends only on the public [`untheme`](../packages/untheme) package — never on the internal `@untheme/*` subpackages — so core internals stay free to change.

| Integration                           | Directory                 | Description                                     |
| ------------------------------------- | ------------------------- | ----------------------------------------------- |
| [`@untheme/codemirror`](./codemirror) | `integrations/codemirror` | CodeMirror 6 editor theme from a contract       |
| [`@untheme/nuxt`](./nuxt)             | `integrations/nuxt`       | Nuxt module for runtime theming                 |
| [`@untheme/shiki`](./shiki)           | `integrations/shiki`      | Shiki syntax-highlighting theme from a contract |
| [`@untheme/terrazzo`](./terrazzo)     | `integrations/terrazzo`   | DTCG token JSON → `untheme.config.ts` codegen   |
