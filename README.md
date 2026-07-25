# eslint-plugin-import-boundary

ESLint rule that turns **directory nesting** into import boundaries inside one package. By default only a parent may import a direct child’s **public entry** (`index` via [`publicEntryFiles`](docs/public-entry-files.md))—skip-level, upward, and peer imports are denied. Use `rootFiles` to connect separate trees (almost always needed for sibling feature folders), and `sharedFiles` for shared logic under an owner.

## Install

```bash
pnpm add -D eslint-plugin-import-boundary eslint
```

## Usage

```js
// eslint.config.js
import importBoundary, {
  extractDirectChildDirs,
} from "eslint-plugin-import-boundary";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    // ignores: ["**/*.{test,spec}.{ts,tsx}", "**/__tests__/**", "**/*.stories.{ts,tsx}"],
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
          // List every tree that should expose a public entry to other trees
          // (app/pages/features peers cannot import each other without this).
          rootFiles: [
            "src/app",
            "src/pages",
            ...extractDirectChildDirs("src/features"),
          ],
        },
      ],
    },
  },
];
```

Full boundary rules, diagrams, and allow/deny examples: [docs](https://nayounsang.github.io/eslint-plugin-import-boundary/).

## Options

| Option | Type | Default | Meaning |
|--------|------|---------|---------|
| `publicEntryFiles` | `string[]` (optional) | `["**/index"]` | File globs for each folder’s public entry (basename match is extension-agnostic). Directory globs are rejected. |
| `sharedFiles` | `string[]` (optional) | `[]` | Glob patterns for shared resources. Matched targets may be imported by modules under the owning folder (parent of the shared entry). |
| `rootFiles` | `(string \| { path: string; allowedDependencies?: string[]; allowFreeInternal?: boolean })[]` | `[]` | Directory paths for tree roots (e.g. `src/features/auth`). String entries may import **each other’s public entry**; object entries list outbound roots in `allowedDependencies`. Set `allowFreeInternal: true` to allow any import within that root while keeping cross-root public-entry-only. |

## Helpers

| Export | Meaning |
|--------|---------|
| `extractDirectChildDirs(parentPath, cwd?)` | Immediate child directories of `parentPath` as cwd-relative posix paths—handy to spread into `rootFiles`. See [docs](https://nayounsang.github.io/eslint-plugin-import-boundary/#/extract-direct-child-dirs). |

## Release

Versioning and publishing use [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset            # record a change (patch / minor / major)
pnpm version-packages     # apply changesets → bump version + CHANGELOG
pnpm release              # build and publish to npm
```

On `main`, the Release workflow opens a version PR when changesets exist, and publishes after that PR is merged (requires repo secret `NPM_TOKEN`).

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
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Test with coverage |
| `pnpm dev` | Test watch mode |
| `pnpm dev:docs` | Serve docs locally |
| `pnpm lint` | Lint |
| `pnpm typecheck` | Typecheck |

To add a docs page, create `{pageName}.md` and list it in `docs/_sidebar.md`.
