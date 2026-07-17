# eslint-plugin-import-boundary

ESLint rule that enforces import boundaries based on directory nesting. Apply the rule only to the files you care about via ESLint `files`.

## Problem

- Imports can freely cross peers, skip levels, or reach into another folder's internals. Cohesion erodes, coupling spreads, and a small change can touch far more than expected. Ownership and maintenance become harder to reason about.
- In the JS world, `package.json` `"exports"` splits can close **package** borders—but they also split build and management into separate processes, and inside a single package folder-to-folder imports stay wide open.
- Review conventions alone cannot keep those edges reliable.

## Solution

- This plugin turns those boundaries into an automated, deterministic check at lint and build time—so violations are caught before they land, and the boundary stays enforceable without relying on memory or discipline.

## Install

```bash
pnpm add -D eslint-plugin-import-boundary eslint
```

## Usage

```js
// eslint.config.js
import importBoundary from "eslint-plugin-import-boundary";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "import-boundary": importBoundary,
    },
    rules: {
      "import-boundary/import-boundary": [
        "error",
        {
          sharedFiles: [
            "**/shared.ts",
            "**/shared.*.ts",
            "**/shared/**",
          ],
        },
      ],
    },
  },
];
```

> For the full boundary rules and allow/deny examples, see the [docs](https://nayounsang.github.io/eslint-plugin-import-boundary/).

## Options

| Option | Type | Default | Meaning |
|--------|------|---------|---------|
| `sharedFiles` | `string[]` (optional) | `[]` | Glob patterns for shared resources. Matched targets may be imported freely by modules under the owning folder (parent of the shared entry). Examples: `**/foo.ts`, `**/foo.*.ts`, `**/foo/**`. |
| `files` | `string[]` (optional) | `[]` | Same-style globs as ESLint `files` (e.g. `A/**/*.{ts,tsx}`). Each pattern’s path before `/**` is a tree root. Within a root, modules may import **sibling direct-child barrels** of that root. Across roots, only the **other root’s barrel** is allowed. |

## Rules in short

What a consumer may import:

| From → To | Allowed? |
|-----------|----------|
| Parent → direct child **barrel** (`./B`) | Yes |
| Parent → grandchild or child internals | No |
| Sibling → sibling | No (unless both are direct children of a `files` root—then sibling **barrels** only) |
| Child → ancestor | No (except `sharedFiles` owned by that ancestor) |
| Nested folder → parent-peer (uncle/aunt) | No |
| Any module under `files` root `A` → root `B`’s **barrel** | Yes |
| Any module under `files` root `A` → internals under `B` | No |
| Descendant under a shared owner → that owner’s shared file/folder | Yes |

Path aliases from the nearest `tsconfig.json` / `jsconfig.json` `compilerOptions.paths` are resolved and checked like relative imports. Other non-relative imports (npm packages, unmatched bare specifiers) are not checked. Lint scope is controlled by ESLint `files`; cross-tree roots use the rule option `files`.

### Example

```js
// eslint.config.js
import importBoundary from "eslint-plugin-import-boundary";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "import-boundary": importBoundary,
    },
    rules: {
      "import-boundary/import-boundary": [
        "error",
        {
          sharedFiles: [
            "**/shared.ts",
            "**/shared.*.ts",
            "**/shared/**",
          ],
          files: [
            "src/A/**/*.{ts,tsx}",
            "src/E/**/*.{ts,tsx}",
          ],
        },
      ],
    },
  },
];
```

```text
src/
├── A/
│   ├── index.ts
│   ├── shared.ts
│   ├── B/
│   │   └── index.ts
│   └── C/
│       ├── index.ts
│       └── D/
│           └── index.ts
└── E/
    └── index.ts
```

#### Allowed

- `B → A`, `C → A`, `D → C` — direct child barrel only
- `B → A/shared` — shared owned by `A`, imported from under `A`
- With `files` as above: `B → C` / `C → B` (sibling barrels under root `A`), and `B → E` / `E → A` (other root’s barrel only)

#### Forbidden

- `A → C/D` — skip-level / non-direct descendant
- `B → A` (the ancestor module itself) — upward import (`shared` is the exception)
- `B → E/…` internals (e.g. a child under `E`) — cross-root must use `E`’s barrel only
- `D → B` — parent-peer (uncle)
- Direct child via an internal path instead of `./B` — barrel only

Without the `files` option, `B → C` / `C → B` and `A → E` / `E → A` would also be forbidden (plain peers).


## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

| Script | Purpose |
|--------|---------|
| `pnpm build` | Compile `src/` to `dist/` |
| `pnpm test` | Run Vitest once |
| `pnpm dev` | Vitest watch mode |
| `pnpm test:coverage` | Vitest with coverage |
| `pnpm lint` | ESLint on `src/` |
| `pnpm typecheck` | `tsc --noEmit` |

Docs: [https://nayounsang.github.io/eslint-plugin-import-boundary/](https://nayounsang.github.io/eslint-plugin-import-boundary/) (source in [`docs/`](./docs/), Docsify). Serve locally with `npx serve docs`.
