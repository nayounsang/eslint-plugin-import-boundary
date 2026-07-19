# `extractDirectChildDirs`

Named export that lists **immediate child directories** of a parent path. Useful when building `rootFiles` (or similar path lists) without typing every feature folder by hand.

```ts
extractDirectChildDirs(parentPath: string, cwd?: string): string[]
```

## Behavior

- Resolves `parentPath` against `cwd` (default `process.cwd()`). Absolute paths are used as-is.
- Returns **only direct child directories** (not files, not nested grandchildren).
- Skips hidden directories whose names start with `.`.
- Paths are posix-style and **relative to `cwd`** when the parent is under `cwd`; sorted alphabetically.
- Throws if the path cannot be read as a directory.

## Example with `rootFiles`

```js
import importBoundary, {
  extractDirectChildDirs,
} from "eslint-plugin-import-boundary";

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

For a tree like:

```text
src/features/
├── auth/
├── cart/
└── readme.md
```

`extractDirectChildDirs("src/features")` returns `["src/features/auth", "src/features/cart"]`.

## Related

- Wiring those paths as trees: [`rootFiles`](root-files.md)
- Install / minimal config: [Quick start](quick-start.md)
