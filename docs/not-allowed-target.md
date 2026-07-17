# `notAllowedTarget`

## Intent

Anything that is not a permitted downward barrel edge (and not covered by [`sharedFiles`](shared-files.md) or [`files`](files.md)) is denied as `notAllowedTarget`. Typical cases: **peers**, **parent-peers (uncles)**, and **deep paths into another subtree**.

## Allowed (reminders)

- Parent → direct child **barrel**
- Under [`files`](files.md) roots: sibling direct-child barrels; other root’s barrel only
- Under an owner: that owner’s [`sharedFiles`](shared-files.md) matches

## Forbidden → `notAllowedTarget`

```text
shell/
├── menu/
│   ├── menu.tsx
│   └── detail/
│       └── detail.tsx
└── tabs/
    ├── index.ts
    └── util.ts
```

### Peer barrel

```ts
// shell/menu/menu.tsx
import { Tabs } from "../tabs"; // notAllowedTarget (unless files makes them root siblings)
```

### Peer / nephew internals

```ts
import { util } from "../tabs/util"; // notAllowedTarget
import { Detail } from "../menu/detail"; // from tabs — nephew deep path
```

### Parent-peer (uncle)

```ts
// shell/menu/detail/detail.tsx
import { Tabs } from "../../tabs"; // notAllowedTarget — uncle of detail
```

### Flat peers

```ts
// menu/menu.tsx (siblings under project root)
import { Session } from "../session"; // notAllowedTarget
```

### Cross-root internals (with `files`)

Even when `files` allows another root’s barrel, its **internals** stay closed:

```ts
import { x } from "../../E/child"; // notAllowedTarget — use E’s barrel
```

Message:

> `"from"` is not allowed to import `"to"`.

## Related

- Opt-in sibling / cross-root barrels: [`files`](files.md)
- Shared resources: [`sharedFiles`](shared-files.md)
- Ancestor modules: [`upwardImport`](upward-import.md)
- Grandchildren: [`skipLevelImport`](skip-level-import.md)
