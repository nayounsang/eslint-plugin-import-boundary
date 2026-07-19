import { isDirectChild } from "./child.js";
import { isFilesCrossImport } from "./files.js";
import {
    EMPTY_ROOT_FILES_GRAPH,
    type RootFilesGraph,
} from "./files-roots.js";

export { isDirectChild, isDescendantNonDirect } from "./child.js";
export { isAncestor } from "./parent.js";
export { isFilesCrossImport } from "./files.js";
export {
    parseFilesRoots,
    parseRootFilesGraph,
    getFilesRoot,
    EMPTY_ROOT_FILES_GRAPH,
    type RootFilesGraph,
    type RootFilesEntry,
} from "./files-roots.js";

/** Targets that may be imported via barrel: direct child or rootFiles cross-root. */
export function isAllowedTarget(
    fromPath: string,
    toPath: string,
    graph: RootFilesGraph = EMPTY_ROOT_FILES_GRAPH,
): boolean {
    return (
        isDirectChild(fromPath, toPath) ||
        isFilesCrossImport(fromPath, toPath, graph)
    );
}
