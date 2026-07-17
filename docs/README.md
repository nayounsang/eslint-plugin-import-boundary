# Why import boundaries?

## Problem

In a single package, folder-to-folder imports are usually unrestricted:

- A module can reach into a peer’s internals, skip a level, or import an ancestor.
- Cohesion erodes, coupling spreads, and a small change can touch far more than expected.
- Ownership (“who owns this edge?”) becomes hard to reason about in review.

`package.json` `"exports"` can close **package** borders, but it also splits build and management. Inside one package, folder boundaries stay open unless you enforce them yourself. Conventions alone do not hold.

## Solution

This plugin turns directory nesting into an automated lint rule:

1. **Public surface = index barrel** — consumers import a folder via its barrel, not its internals.
2. **Nesting defines who may talk to whom** — parent → direct child barrel; peers and skip-levels are denied by default.
3. **Opt-in escapes** — [`sharedFiles`](shared-files.md) for shared resources under an owner; [`files`](files.md) for sibling / cross-root barrels inside chosen trees.

Violations show up at lint time with clear message ids (`barrelOnly`, `upwardImport`, `skipLevelImport`, `notAllowedTarget`), so the boundary does not depend on memory or review discipline.

## How to read these docs

Each page describes the rule from a **user** perspective: what imports (and `export … from`) are allowed or denied, with tree examples. Internal implementation is out of scope.

| Topic | What it covers |
|-------|----------------|
| [Quick start](quick-start.md) | Install and minimal flat-config setup |
| [Barrel only](barrel-only.md) | Import the folder’s index, not internals |
| [sharedFiles](shared-files.md) | Shared resources under an owning folder |
| [files](files.md) | Sibling and cross-root barrels inside tree roots |
| [upwardImport](upward-import.md) | Child must not import an ancestor module |
| [skipLevelImport](skip-level-import.md) | Parent must not skip to a grandchild |
| [notAllowedTarget](not-allowed-target.md) | Peers, uncles, and other forbidden targets |
