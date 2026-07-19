# Option: `publicEntryFiles`

A folder’s **public API** is the file(s) matched by `publicEntryFiles`. Consumers may import that surface (the folder path, or the entry file explicitly)—not files buried inside the folder.

By default every folder’s entry is named `index` (any extension). Override with other basename globs when needed (`**/mod`, `**/public`, …).

## File globs only

`publicEntryFiles` accepts **file globs** only. Directory globs are rejected when options are parsed.

Import boundaries are enforced at **file granularity**: the public surface of a folder is a named entry *module* (a single resolvable file). A directory pattern (for example `**/api/**`) would treat an open set of paths under that tree as public, so the allowed import graph stops being a closed, predictable surface and the layout drifts toward an ad-hoc public tree instead of one entry module per folder.

Rejected (throws):

```js
{
  publicEntryFiles: [
    "**/api/**", // directory tree
    "**/api/*", // directory children
    "src/api/", // trailing slash = directory
  ],
}
```

Allowed:

```js
{
  publicEntryFiles: [
    "**/index",
    "**/mod",
    "**/public",
    "**/public.ts",
  ],
}
```

## Default

Omitting the option is the same as:

```js
{
  publicEntryFiles: ["**/index"],
}
```

Matching is **extension-agnostic** for patterns without a suffix: `**/index` covers `index.ts`, `index.mts`, `index.js`, and so on. Patterns that include an extension (for example `**/public.ts`) still work.

## Configuration patterns

```js
{
  publicEntryFiles: [
    "**/index",
    "**/mod",
    "**/public",
    "**/public.ts",
  ],
}
```

| Glob | Matches |
|------|---------|
| `**/index` | Any `index.*` public entry (default) |
| `**/mod` | Deno-style `mod.ts` / `mod.js` / … |
| `**/public` | Basename `public`, any extension |
| `**/public.ts` | Only `public.ts` |

## Allowed

```ts
// publicEntryFiles default (**/index)
import { Menu } from "./menu"; // OK — folder path
import { Menu } from "./menu/index.js"; // OK — explicit entry

// publicEntryFiles: ["**/public"]
import { Menu } from "./menu"; // OK
import { Menu } from "./menu/public"; // OK
```

## Forbidden

```ts
// publicEntryFiles: ["**/public"]
import { x } from "./menu/index"; // not a public entry under this config
import { x } from "./menu/internal"; // internal file
```

> Import from `"…"` must use its public entry, not internal files, because the import path must be the canonical public entry form.

Empty `publicEntryFiles: []` disables entry stripping: `./menu/index` is treated as an internal path, not the folder surface.

## Related

- Default allow/deny: [Default boundaries](default-boundaries.md)
- Shared logic under an owner: [`sharedFiles`](shared-files.md)
- Cross-tree public entries: [`rootFiles`](root-files.md)
