# `skipLevelImport`

## Intent

A parent may depend only on a **direct child barrel**. Jumping to a grandchild (or deeper) skips the child’s public surface and couples you to nested structure.

## Allowed

```text
shell/
├── shell.tsx
└── menu/
    ├── index.ts
    └── detail/
        └── index.ts
```

```ts
// shell/shell.tsx
import { Menu } from "./menu"; // OK — direct child barrel

// shell/menu/… (from inside menu)
import { Detail } from "./detail"; // OK — menu’s direct child
```

## Forbidden → `skipLevelImport`

```ts
// shell/shell.tsx
import { Detail } from "./menu/detail"; // skipLevelImport — grandchild
```

Same for `export * from "./menu/detail"` and similar re-exports.

Message:

> `"from"` cannot import `"to"` directly. Use a direct child instead.

## Related

- Wrong path to an otherwise valid child: [`barrelOnly`](barrel-only.md)
- Peer / uncle targets: [`notAllowedTarget`](not-allowed-target.md)
