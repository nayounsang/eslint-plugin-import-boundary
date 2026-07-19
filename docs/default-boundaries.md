# Default boundaries

With the rule enabled, imports follow directory nesting. A folder’s **public API is its [`publicEntryFiles`](public-entry-files.md) entry** (default: `index`). Consumers import that surface—not files buried inside the folder.

The same checks apply to `import … from`, `export … from`, and `export * from`.

Every denial includes a **reason** in the message (`… because …`).

## What is allowed

| From → To | Allowed? |
|-----------|----------|
| Parent → direct child **public entry** (`./B`) | Yes |
| Descendant under a shared owner → that owner’s [`sharedFiles`](shared-files.md) | Yes |
| Under `rootFiles` root `A` → root `B`’s **public entry** (when allowed) | Yes ([`rootFiles`](root-files.md)) |

```ts
// shell/shell.tsx
import { Menu } from "./menu"; // OK — direct child public entry
import { Menu } from "./menu.js"; // OK — ESM extension
import { Menu } from "./menu/index.js"; // OK — explicit index (default publicEntryFiles)
```

## What is denied

| From → To | Message id |
|-----------|------------|
| Parent → grandchild / child internals (skip-level) | `skipLevelImport` |
| Child → ancestor module | `upwardImport` |
| Sibling → sibling (same parent) | `notAllowedTarget` |
| Nested folder → parent-peer (uncle/aunt) | `notAllowedTarget` |
| Valid child via a non-canonical path | `publicEntryOnly` |
| Under root `A` → internals under root `B` | `notAllowedTarget` |

### Skip-level

```ts
// shell/shell.tsx — tree: shell/menu/detail
import { Detail } from "./menu/detail"; // skipLevelImport
```

> `"from"` cannot import `"to"` directly because only a direct child's public entry may be imported.

### Upward

```ts
// shell/menu/menu.tsx
import { Shell } from ".."; // upwardImport
```

> `"from"` cannot import ancestor `"to"` because child modules may not import ancestors (except sharedFiles).

Exception: a [`sharedFiles`](shared-files.md) resource owned by that ancestor.

### Public entry only

```ts
// shell/shell.tsx
import { Menu } from "../shell/menu"; // publicEntryOnly — use "./menu"
import { x } from "./menu/internal"; // not a public entry surface
```

> Import from `"…"` must use its public entry, not internal files, because the import path must be the canonical public entry form.

### Peers and cross-root

Same-root siblings stay denied even when `rootFiles` lists that root:

> `"from"` cannot import `"to"` because they are sibling modules under the same parent.

Separate trees (for example `app` → `features/auth`, or `auth` → `cart`) need every side listed in [`rootFiles`](root-files.md). Without those entries (or without an allowed edge) they are `notAllowedTarget`, with a reason such as:

> cross-root import requires both sides in rootFiles (and an allowed edge)

Importing another root’s **internals** (not its public entry):

> only that root's public entry is importable across roots

## Path aliases

Aliases from the nearest `tsconfig.json` / `jsconfig.json` `compilerOptions.paths` are resolved and checked like relative imports. Other non-relative imports (npm packages, unmatched bare specifiers) are not checked.
