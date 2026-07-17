# Quick start

## Install

```bash
pnpm add -D eslint-plugin-import-boundary eslint
```

Requires ESLint 9 (flat config).

## Enable the rule

Scope the rule with ESLint `files` to the trees you care about:

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

## What you get by default

Without extra options (beyond optional `sharedFiles`):

- Parent → direct child **index barrel** is allowed (`./menu`).
- Skip-level, upward, and peer imports are denied—so dependency boundaries stay predictable.
- Path aliases from the nearest `tsconfig.json` / `jsconfig.json` are checked like relative imports; npm packages are ignored.

## Next steps

| Goal | Page |
|------|------|
| Common logic inside one concern | [`sharedFiles`](shared-files.md) |
| Different concerns depending on each other | [`files`](files.md) |
| Barrel path shape | [Barrel only](barrel-only.md) |
| Why use import-boundary | [Home](README.md) |
