# Integrations

The packages in this folder connect untheme to host frameworks. The runtime of each integration uses the public [`untheme`](../packages/untheme) package. The Nuxt module runs the build kit, [`@untheme/kit`](../packages/kit), at build time.

| Integration                           | Directory                 | Description                                              |
| ------------------------------------- | ------------------------- | -------------------------------------------------------- |
| [`@untheme/codemirror`](./codemirror) | `integrations/codemirror` | Makes a CodeMirror 6 editor theme from a contract.       |
| [`@untheme/nuxt`](./nuxt)             | `integrations/nuxt`       | Adds runtime theming to a Nuxt app.                      |
| [`@untheme/shiki`](./shiki)           | `integrations/shiki`      | Makes a Shiki syntax-highlighting theme from a contract. |
