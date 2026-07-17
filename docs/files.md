# Option: `files`

## Intent

By default, **sibling folders cannot import each other**. That is often too strict for a domain tree where several direct children of a root are peers that should talk only through barrels.

`files` uses the same style of globs as ESLint `files` (for example `src/A/**/*.{ts,tsx}`). The path **before** `/**` becomes a **tree root**.

Under those roots:

- Modules may import **sibling direct-child barrels** of the same root.
- Across roots, only the **other root’s barrel** is allowed (not internals under that root).

## Configuration

```js
{
  files: [
    "src/A/**/*.{ts,tsx}",
    "src/E/**/*.{ts,tsx}",
  ],
}
```

Here the roots are `src/A` and `src/E`.

## Allowed

```text
src/
├── A/                 ← files root
│   ├── index.ts
│   ├── B/
│   │   └── index.ts
│   └── C/
│       └── index.ts
└── E/                 ← files root
    └── index.ts
```

```ts
// A/B → A/C sibling barrel
import { C } from "../C"; // OK under root A

// A/B → E root barrel
import { E } from "../../E"; // OK — other root’s barrel only

// A → B direct child (always OK)
import { B } from "./B"; // OK
```

Nested modules under a child may still reach a sibling barrel of the root:

```ts
// A/B/nested → A/C
import { C } from "../../C"; // OK — sibling barrel under root A
```

## Forbidden

```ts
// Into another root’s internals
import { x } from "../../E/child"; // notAllowedTarget

// Peer deep path instead of barrel
import { x } from "../C/internal"; // notAllowedTarget / barrelOnly

// Upward to the files root module as a general ancestor import
import { A } from ".."; // upwardImport (from a child under A)
```

Without `files`, plain peers stay denied:

```ts
import { C } from "../C"; // notAllowedTarget when files is omitted
```

## Related

- Barrel path shape: [Barrel only](barrel-only.md)
- Shared resources under an owner: [`sharedFiles`](shared-files.md)
