# Integrations

Bridges between untheme and host frameworks. Each integration depends only on the public [`untheme`](../packages/untheme) package — never on the internal `@untheme/*` subpackages — so core internals stay free to change.

| Integration               | Directory           | Description                     |
| ------------------------- | ------------------- | ------------------------------- |
| [`@untheme/nuxt`](./nuxt) | `integrations/nuxt` | Nuxt module for runtime theming |
