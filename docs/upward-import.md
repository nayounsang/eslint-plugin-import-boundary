# `upwardImport`

## Intent

A child must not import an **ancestor module**. Dependencies should flow downward (parent → child barrel), not upward. That keeps upper layers free of reverse coupling from nested features.

## Allowed (exceptions)

The usual exception is a [`sharedFiles`](shared-files.md) resource owned by that ancestor:

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

## Forbidden → `upwardImport`

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

- Shared escape hatch: [`sharedFiles`](shared-files.md)
- Other forbidden relationships: [`notAllowedTarget`](not-allowed-target.md)
