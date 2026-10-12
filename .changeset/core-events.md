---
"@untheme/core": minor
---

The service emits an event after each write lands in the container. `on(event,
listener)` subscribes to one and returns the function that removes the
listener. Each listener receives one change object with the `field` the write
replaced and the stored values `before` and `after` the write. `input` fires
after `swap`. `patch` fires after `update` or `apply`, and its change object
adds `diff`: the difference between the active theme before the write and
after it, in the shape of a patch. `change` fires after either with the same
object. A write through `config` emits too. A write to the container itself
does not, and a write that fails the contract throws before it emits. The
service builds the change object only when something listens. A consumer that
redraws on a theme change subscribes here instead of wrapping the `set`
middleware.
