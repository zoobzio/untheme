# @untheme/catalog

Theme distribution protocol for the untheme design token system.

Defines the contract for where themes come from: a catalog is anything that can list its entries and hand over a layer by id. One wire shape serves every hop — a browser asking its own app server, that server asking a remote theme service — so the same code consumes a catalog wherever it lives.

## The model

The runtime service ([`@untheme/core`](../core)) holds one active theme and no collection; switching themes means handing `apply` a complete layer. This package owns everything before that handoff: discovering what themes exist, fetching one, and proving it against the app's contract on the way in.

A catalog has two operations:

- **list** — the manifest: entry metadata (id, name) for discovery, never full payloads.
- **get** — one layer by id, as pure JSON.

Both facets of the package satisfy that same shape:

- **Provider** — the serving facet. Accepts callbacks that reach the actual storage (build-time JSON, a database, a remote service) and fronts them with validation. Framework handlers map routes onto it.
- **Client** — the consuming facet. Accepts transport config — where to make requests, what authentication to use — and validates every response on the way in.

Both are constructed with an instantiated `Schema<T>` from [`@untheme/schema`](../schema), which drives type inference and supplies the runtime proof: a layer is never typed as valid without having been checked. Because Provider and Client share one shape, a provider callback can delegate to a client — the app's provider serves its build-time themes and falls back to a remote catalog through the same interface it implements.

## Querying

Catalogs can grow beyond what a single response should carry, so `list` is query-shaped: a plain JSON-serializable query object (filter, sort, pagination) that crosses the wire unchanged, and a paged result. Every query is validated and normalized before a source sees it, so callbacks receive a concrete window — a `Listing` — and implement exactly the query model against their own storage: filter, order, cut the window, count the matches.

## Usage

```ts
import { defineCatalog, defineClient } from "@untheme/catalog";

// the serving angle: callbacks over wherever the themes live
const local = defineCatalog(schema, {
  list: (listing) => store.list(listing),
  get: (id) => store.get(`themes/${id}`),
});

// the consuming angle: transport config over the wire protocol
const remote = defineClient(schema, {
  base: "https://themes.example.dev",
  headers: { authorization: `Bearer ${token}` },
});

// same shape either way — and shapes matching is what lets catalogs chain
const catalog = defineCatalog(schema, {
  list: (listing) => local.list(listing),
  get: async (id) => (await local.get(id)) ?? remote.get(id),
});

await catalog.list({ search: "nord", limit: 10 }); // a Page of entries
await catalog.get("nord"); // a Layer, proven; undefined on a miss
```

`defineCatalog` is the one machine: `defineClient` compiles its transport config into the same callback shape and boots it, so both angles share every behavior. Queries are validated (`MalformedQueryError`) and normalized before any source sees them, listings are proven to be pages (`MalformedPageError`), and retrieved payloads are proven against the contract (`MalformedLayerError`) — a corrupt payload can never pass as a miss. On the wire, a failure status raises `FailedRequestError`; a 404 answering a retrieval is the one exception, resolving as a miss.

## The wire protocol

Two GET routes, hanging off a client's `base`:

- `{base}/themes?q={json}` — the normalized listing, JSON-encoded in one parameter; answers a `Page`.
- `{base}/themes/{id}` — one layer as pure JSON; answers 404 for a miss.

A serving handler decodes `q`, proves it with `isQuery`, and hands it to its catalog — anything that speaks this shape can be consumed by `defineClient`, and anything built by `defineCatalog` can be served over it.

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime guards.
- [`@untheme/core`](../core) — the runtime theme service a catalog feeds.
- [`untheme`](../untheme) — umbrella package re-exporting the public surface.
