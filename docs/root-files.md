# Option: `rootFiles`

Use `rootFiles` when separate directory trees should depend on each other through each tree’s public surface (its [`publicEntryFiles`](public-entry-files.md) entry, default `index`). Without it, peer folders cannot import each other—so for a typical `app` / `pages` / `features/*` layout you list **every** tree that should expose a public entry, not only the feature folders.

Each entry is a **directory path** (for example `src/features/auth`). That path is a **tree root**. Listed roots may import **another root’s public entry** only—not internals, and not sibling folders under the same root. String entries connect to each other in both directions; object entries use `allowedDependencies` for one-way edges.

## Flow inside one root

Each `rootFiles` entry is one tree. Imports under it follow nesting—parent folders depend on their direct children.

```js
{
  rootFiles: ["src/features/auth"],
}
```

```text
src/features/auth/
├── login/
│   ├── form/
│   └── otp/
└── session/
    └── refresh/
```

```mermaid
flowchart TB
  form[form] --> login[login]
  otp[otp] --> login
  login --> auth[auth]
  refresh[refresh] --> session[session]
  session --> auth
```

Within that tree, the default rules still apply (parent → direct child public entry; skip-level, upward, and same-root siblings stay denied). See [Default boundaries](default-boundaries.md).

## Listing many feature roots

Instead of typing every folder under `src/features`, spread [`extractDirectChildDirs`](extract-direct-child-dirs.md):

```js
import { extractDirectChildDirs } from "eslint-plugin-import-boundary";

{
  rootFiles: [
    "src/app",
    "src/pages",
    ...extractDirectChildDirs("src/features"),
  ],
}
```

## Roots referencing each other

List each tree you want to connect—including composers like `app` / `pages` if they import features. Internals are not part of this picture—only the roots.

```js
{
  rootFiles: [
    "src/app",
    "src/pages",
    "src/features/auth",
    "src/features/cart",
    "src/features/checkout",
    "src/features/profile",
  ],
}
```

```mermaid
graph LR
  app --- pages
  app --- auth
  app --- cart
  pages --- auth
  pages --- cart
  auth --- cart
  auth --- checkout
  auth --- profile
  cart --- checkout
  cart --- profile
  checkout --- profile
```

Every pair among **string** entries may talk (bidirectional).

## Directed dependencies

Use an object entry when one root should depend on others **one way**. `path` is the same directory path form as a string entry. `allowedDependencies` lists other roots’ paths whose public entries this root may import.

```js
{
  rootFiles: [
    "src/features/auth",
    "src/features/cart",
    {
      path: "src/features/checkout",
      allowedDependencies: [
        "src/features/auth",
        "src/features/cart",
      ],
    },
  ],
}
```

```mermaid
flowchart LR
  auth <--> cart
  checkout -->|allowedDependencies| auth
  checkout -->|allowedDependencies| cart
```

- `checkout → auth` and `checkout → cart` are allowed (public entries only).
- `auth ↔ cart` stay bidirectional because both are strings.
- `auth → checkout` and `cart → checkout` stay denied.

Omit `allowedDependencies` (or pass `[]`) to register a root with **no** outbound cross-root edges. String entries never auto-connect to object entries—list the reverse edge explicitly if you need it.

## Allowed

```ts
// Under auth → cart’s public entry
import { Cart } from "../../cart"; // OK

// auth → cart (root to other root)
import { Cart } from "../cart"; // OK

// Direct child under the same tree (always OK; not specific to rootFiles)
import { Login } from "./login"; // OK
```

## Forbidden

```ts
// Same-root siblings are NOT opened by rootFiles
import { Otp } from "../otp"; // notAllowedTarget — siblings under the same parent

// Into another root’s internals
import { x } from "../../cart/item"; // notAllowedTarget — only that root's public entry…

// Upward to the rootFiles root module as a general ancestor import
import { Auth } from ".."; // upwardImport — child modules may not import ancestors…
```

Without `rootFiles`, peer trees stay denied—so omit a root only when nothing outside that tree should import its public entry.

## Related

- Expand child folders: [`extractDirectChildDirs`](extract-direct-child-dirs.md)
- Shared logic inside one tree: [`sharedFiles`](shared-files.md)
- Default allow/deny: [Default boundaries](default-boundaries.md)
