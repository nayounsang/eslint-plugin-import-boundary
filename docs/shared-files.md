# Option: `sharedFiles`

## Why

Use `sharedFiles` for **common logic inside one concern (domain)**—helpers, types, a `shared` module—without opening every ancestor module as a general import target. It is not for wiring separate concerns together; that is [`files`](files.md).

`sharedFiles` is a list of glob patterns. A match has an **owning folder** (the parent of the shared entry). Any module **under that owner** may import the shared resource freely — including what would otherwise be an upward import.

## Configuration

```js
{
  sharedFiles: [
    "**/shared.ts",
    "**/shared.*.ts",
    "**/shared/**",
  ],
}
```

Typical pattern shapes:

| Glob | Matches |
|------|---------|
| `**/foo.ts` / `**/foo.tsx` | A single shared file named `foo` |
| `**/foo.*.ts` / `**/foo.*.tsx` | Prefixed shared files (`foo.helpers.ts`, …) |
| `**/foo/**` | Everything under a shared folder `foo/` |

## Allowed

```text
shell/
├── foo.ts          ← shared common logic (owner: shell)
├── menu/
│   ├── menu.tsx
│   └── detail/
│       └── detail.tsx
└── …
```

With `sharedFiles: ["**/foo.ts", "**/foo.tsx"]`:

```ts
// shell/menu/menu.tsx
import { x } from "../foo"; // OK — shared owned by shell

// shell/menu/detail/detail.tsx
import { x } from "../../foo"; // OK — still under owner shell
```

Shared folders:

```ts
// sharedFiles: ["**/foo/**"]
import { format } from "../foo/format"; // OK from under the owner
```

## Forbidden

Shared is **not** a free pass for unrelated edges:

- Skip-level into non-shared children → [`skipLevelImport`](skip-level-import.md)
- Peer barrels that are not shared → `notAllowedTarget` (use [`files`](files.md) to connect concerns)
- Importing a non-shared ancestor module → [`upwardImport`](upward-import.md)

```ts
// shell/menu/menu.tsx
import { Tabs } from "../tabs"; // notAllowedTarget — tabs is not shared

// shell/menu/detail/detail.tsx
import { Menu } from ".."; // upwardImport — ancestor module, not shared
```

Modules outside the owning folder cannot treat that shared resource as theirs under this exception.
