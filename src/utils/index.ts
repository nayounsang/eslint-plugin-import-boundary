export {
    classifyImport,
    getModulePath,
    getReportedToPath,
    resolveImport,
    toReportPath,
    type ResolvedImport,
    type Violation,
    type ViolationId,
} from "./boundary-context.js";
export type { BoundaryOptions } from "./options.js";
export { parseOptions } from "./options.js";
export {
    parseFilesRoots,
    parseRootFilesGraph,
    EMPTY_ROOT_FILES_GRAPH,
    type RootFilesGraph,
    type RootFilesEntry,
} from "./relations/index.js";
export { clearTsconfigPathsCache } from "./tsconfig-paths.js";
export { extractDirectChildDirs } from "./extract-direct-child-dirs.js";
