# Why use import-boundary

## Problem

In a single package, folder-to-folder imports are usually unrestricted:

- A module can reach into a peer’s internals, skip a level, or import an ancestor.
- Cohesion erodes, coupling spreads, and a small change can touch far more than expected.
- Ownership (“who owns this edge?”) becomes hard to reason about in review.

`package.json` `"exports"` can close **package** borders, but it also splits build and management. Inside one package, folder boundaries stay open unless you enforce them yourself. Conventions alone do not hold.

### How other languages handle this

Other languages already have built-in answers to this. For example, **Go** ties privacy to packages (and `internal/`), and **Rust** encodes module visibility with `pub` / `pub(crate)`.

## Solution

This plugin turns directory nesting into an automated lint rule:

1. **Public surface = index barrel** — consumers import a folder via its barrel, not its internals.
2. **Predictable dependency boundaries** — parent → direct child barrel; upward and skip-level edges are denied by default ([`upwardImport`](upward-import.md), [`skipLevelImport`](skip-level-import.md)).
3. **Opt-ins by concern** — [`sharedFiles`](shared-files.md) for common logic **inside one concern**; [`files`](files.md) so **different concerns** may depend on each other through barrels.

Violations show up at lint time with clear message ids (`barrelOnly`, `upwardImport`, `skipLevelImport`, `notAllowedTarget`), so the boundary does not depend on memory or review discipline.

“Concern” / “domain” here is informal shorthand for a folder tree you treat as one unit of ownership—not a formal DDD claim.
