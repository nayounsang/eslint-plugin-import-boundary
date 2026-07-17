# Barrel only

## Why

A folder’s **public API is its index barrel**. Other modules may depend on that surface, not on files buried inside the folder. That keeps internals free to move without breaking every consumer.

The same check applies to:

- `import … from "…"`
- `export … from "…"`
- `export * from "…"`

## Allowed

Import (or re-export) a **direct child** via its barrel path:

```text
shell/
├── shell.tsx
└── menu/
    └── index.ts   ← public surface
```

```ts
// shell/shell.tsx
import { Menu } from "./menu"; // OK — child barrel
```

Same-folder child barrels work the same way:

```ts
// shell/menu/menu.tsx
import { util } from "./util"; // OK — sibling folder’s barrel under menu
```

## Forbidden

Reaching a allowed target through a **non-canonical** path (or an internal file) is rejected. Use the short barrel specifier, not a detour through parent segments or deep files.

```ts
// shell/shell.tsx
import { Menu } from "../shell/menu"; // barrelOnly — use "./menu"
import { x } from "./menu/internal";  // not a barrel surface
```

Message:

> Import from `"…"` must use its index barrel, not internal files.

## Related

- Skipping past a child to a grandchild is [`skipLevelImport`](skip-level-import.md), not `barrelOnly`.
- Peer folders are denied (`notAllowedTarget`) unless you opt in with [`files`](files.md).
