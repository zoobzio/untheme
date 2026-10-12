---
"@untheme/nuxt": minor
---

The `untheme:input` and `untheme:patch` hooks forward the `input` and `patch`
events of the core service, and the new `untheme:change` hook forwards
`change`. Each hook receives the change object of the service: the `field` the
write replaced, the stored values `before` and `after` the write, and for the
patch the `diff` of the active theme. The plugin calls each hook after the
write lands in the state.
