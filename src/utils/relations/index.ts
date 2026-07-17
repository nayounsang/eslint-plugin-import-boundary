import { isDirectChild } from "./child.js";
import { isFilesCrossImport, isFilesPeerImport } from "./files.js";

export { isDirectChild, isDescendantNonDirect } from "./child.js";
export { isAncestor } from "./parent.js";
export { isFilesCrossImport, isFilesPeerImport } from "./files.js";

/** Targets that may be imported via barrel: direct child, files-peer, or files-cross. */
export function isAllowedTarget(
    fromPath: string,
    toPath: string,
    roots: readonly string[] = [],
): boolean {
    return (
        isDirectChild(fromPath, toPath) ||
        isFilesPeerImport(fromPath, toPath, roots) ||
        isFilesCrossImport(fromPath, toPath, roots)
    );
}
