# `upwardImport`

## Why

Together with [`skipLevelImport`](skip-level-import.md), this rule keeps **dependency boundaries predictable**: nesting says who may depend on whom. A child must not import an **ancestor module**—dependencies flow downward (parent → child barrel), not upward—so upper layers stay free of reverse coupling from nested features.

## Allowed (exceptions)

The usual exception is a [`sharedFiles`](shared-files.md) resource owned by that ancestor (common logic inside the same concern):

```text
shell/
├── foo.ts       ← shared owned by shell
└── menu/
    └── menu.tsx
```

```ts
// shell/menu/menu.tsx
import { x } from "../foo"; // OK when foo matches sharedFiles
```

Direct **downward** imports remain allowed (parent → child barrel) — those are not upward.

## Forbidden

```text
shell/
├── index.ts     (or shell.tsx as the shell module)
└── menu/
    ├── menu.tsx
    └── detail/
        └── detail.tsx
```

```ts
// shell/menu/menu.tsx
import { Shell } from ".."; // upwardImport — parent module

// shell/menu/detail/detail.tsx
import { Shell } from "../.."; // upwardImport — grandparent
import { Menu } from "../../menu"; // upwardImport — ancestor by name
```

Message:

> `"from"` cannot import ancestor `"to"`.

## Related

- Shared common logic in one concern: [`sharedFiles`](shared-files.md)
- Skip-level edges: [`skipLevelImport`](skip-level-import.md)
- Peer / cross-concern edges: `notAllowedTarget` unless opened via [`files`](files.md)
