# Quick start

## Install

```bash
pnpm add -D eslint-plugin-import-boundary eslint
```

Requires ESLint 9 (flat config).

## Minimal config

Nesting rules always apply; **peer trees only talk when each is listed in `rootFiles`**.

A typical frontend layout:

```text
src/
├── app/
├── features/
│   ├── auth/
│   ├── cart/
│   ├── checkout/
│   └── profile/
├── pages/
└── shared/
```

List every tree that should expose a public entry to other trees—including `app` and `pages` if they import features. Top-level `shared/` is covered by `sharedFiles` (`**/shared/**`), not by omitting it from `rootFiles`. Use [`extractDirectChildDirs`](extract-direct-child-dirs.md) to expand `src/features/*` without listing each folder.

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

With that config, `app` / `pages` / each feature may import **each other’s public entries**; feature internals stay closed. Without those entries in `rootFiles`, those peers are denied.

Path aliases from the nearest `tsconfig.json` / `jsconfig.json` are checked like relative imports; npm packages are not.

## What nesting gives you

Inside any folder (with or without `rootFiles`):

- Parent → direct child **public entry** is allowed (`./menu`; default entry name `index`).
- Skip-level, upward, and peer imports are denied (messages include a short **reason**).
- Details: [Default boundaries](default-boundaries.md). Customize entry basenames with [`publicEntryFiles`](public-entry-files.md).

`rootFiles` does not relax same-root siblings—it only opens **listed roots** to each other’s public entries. See [`rootFiles`](root-files.md).

## Next steps

| Goal | Page |
|------|------|
| Connect separate trees | [`rootFiles`](root-files.md) |
| Expand feature folders | [`extractDirectChildDirs`](extract-direct-child-dirs.md) |
| Common logic inside one tree | [`sharedFiles`](shared-files.md) |
| Allow / deny reference | [Default boundaries](default-boundaries.md) |
