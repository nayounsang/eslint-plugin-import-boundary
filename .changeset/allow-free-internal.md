---
"eslint-plugin-import-boundary": patch
---

Add `allowFreeInternal` on `rootFiles` object entries so a root can keep free internal imports while cross-root stays public-entry-only. Split `allowedDependencies` / `allowFreeInternal` docs from `rootFiles`.

