import {
    getFilesRoot,
    type RootFilesGraph,
    EMPTY_ROOT_FILES_GRAPH,
} from "./files-roots.js";

/**
 * Cross rootFiles: `from` is under some root `R`, `to` is a different root `S`
 * that `R` may depend on (the other root’s barrel only).
 */
export function isFilesCrossImport(
    fromPath: string,
    toPath: string,
    graph: RootFilesGraph = EMPTY_ROOT_FILES_GRAPH,
): boolean {
    if (graph.roots.length === 0) return false;
    const fromRoot = getFilesRoot(fromPath, graph.roots);
    if (fromRoot === null) return false;
    if (toPath === fromRoot) return false;
    return graph.allowedDependencies.get(fromRoot)?.has(toPath) ?? false;
}
