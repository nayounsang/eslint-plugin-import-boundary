import { getFilesRoot } from "../files-roots.js";
import { isUnder } from "../module-path.js";
import { isDirectChild } from "./child.js";

/**
 * Same files-root peer: `to` is a direct child barrel of root `R`, and `from`
 * lives under `R` but not under `to`.
 */
export function isFilesPeerImport(
    fromPath: string,
    toPath: string,
    roots: readonly string[],
): boolean {
    if (roots.length === 0) return false;
    const root = getFilesRoot(fromPath, roots);
    if (root === null) return false;
    if (getFilesRoot(toPath, roots) !== root) return false;
    if (!isDirectChild(root, toPath)) return false;
    if (fromPath === toPath) return false;
    if (isUnder(toPath, fromPath)) return false;
    return isUnder(root, fromPath);
}

/**
 * Cross files-root: `from` is under some root `R`, `to` is a different root `S`.
 */
export function isFilesCrossImport(
    fromPath: string,
    toPath: string,
    roots: readonly string[],
): boolean {
    if (roots.length === 0) return false;
    const fromRoot = getFilesRoot(fromPath, roots);
    if (fromRoot === null) return false;
    if (toPath === fromRoot) return false;
    return roots.includes(toPath);
}
