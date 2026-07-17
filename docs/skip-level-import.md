# `skipLevelImport`

## Why

Together with [`upwardImport`](upward-import.md), this rule keeps **dependency boundaries predictable**. A parent may depend only on a **direct child barrel**. Jumping to a grandchild (or deeper) skips the child’s public surface and couples you to nested structure you should not see.

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

## Forbidden

```ts
// shell/shell.tsx
import { Detail } from "./menu/detail"; // skipLevelImport — grandchild
```

Same for `export * from "./menu/detail"` and similar re-exports.

Message:

> `"from"` cannot import `"to"` directly. Use a direct child instead.

## Related

- Upward edges: [`upwardImport`](upward-import.md)
- Wrong path to an otherwise valid child: [`barrelOnly`](barrel-only.md)
- Peer / uncle targets: denied as `notAllowedTarget` unless opened via [`files`](files.md)
