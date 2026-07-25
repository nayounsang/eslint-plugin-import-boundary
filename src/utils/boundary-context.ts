import path from "node:path";
import type { BoundaryOptions } from "./options.js";
import { parentPath } from "./module-path.js";
import {
    DEFAULT_PUBLIC_ENTRY_FILES,
    isPublicEntryPath,
    stripPublicEntry,
} from "./public-entry-files.js";
import {
    isAllowedTarget,
    isAncestor,
    isDescendantNonDirect,
    parseRootFilesGraph,
    getFilesRoot,
    EMPTY_ROOT_FILES_GRAPH,
    type RootFilesGraph,
} from "./relations/index.js";
import { isSharedResourceImport } from "./shared-files.js";
import { resolveAliasPath } from "./tsconfig-paths.js";

export type { BoundaryOptions };

export type ResolvedImport = {
    fromPath: string;
    /** Absolute path without extension / trailing public entry, e.g. `/project/src/shell/tabs` */
    pathNoExt: string | null;
    isExternal: boolean;
};

export type ViolationId =
    | "publicEntryOnly"
    | "upwardImport"
    | "skipLevelImport"
    | "notAllowedTarget";

export type Violation = {
    id: ViolationId;
    reason: string;
};

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

export function getModulePath(filename: string | undefined): string | null {
    if (!filename || filename === "<input>" || filename === "<text>") {
        return null;
    }
    return path.posix.dirname(normalizeSlashes(filename));
}

function stripExtension(absolutePath: string): string {
    return absolutePath.replace(/\.(tsx?|jsx?|mts|cts|mjs|cjs)$/, "");
}

function normalizeDots(value: string): string {
    return value.replace(/\/+$/, "") || ".";
}

function stripTrailingPublicEntryFromImport(
    withoutExt: string,
    toPath: string,
    publicEntryFiles: readonly string[],
): string {
    const normalized = normalizeDots(withoutExt);
    const lastSlash = normalized.lastIndexOf("/");
    const basename =
        lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);
    if (basename === "." || basename === "..") {
        return normalized;
    }

    const absoluteEntry = toPath === "" ? basename : `${toPath}/${basename}`;
    if (!isPublicEntryPath(absoluteEntry, publicEntryFiles)) {
        return normalized;
    }

    if (lastSlash === -1) {
        return ".";
    }
    return normalizeDots(normalized.slice(0, lastSlash)) || ".";
}

export function isBarrelSource(
    importSource: string,
    fromPath: string,
    toPath: string,
    publicEntryFiles: readonly string[] = DEFAULT_PUBLIC_ENTRY_FILES,
): boolean {
    // ESM/TS often spell entries as `./menu.js` or `./menu/index.js`.
    const withoutExt = importSource.replace(
        /\.(tsx?|jsx?|mts|cts|mjs|cjs)$/,
        "",
    );
    const normalized = stripTrailingPublicEntryFromImport(
        withoutExt,
        toPath,
        publicEntryFiles,
    );

    const fromSegments = fromPath === "" ? [] : fromPath.split("/");
    const toSegments = toPath === "" ? [] : toPath.split("/");

    let common = 0;
    while (
        common < fromSegments.length &&
        common < toSegments.length &&
        fromSegments[common] === toSegments[common]
    ) {
        common += 1;
    }

    const upCount = fromSegments.length - common;
    const downSegments = toSegments.slice(common);
    const upPrefix = upCount > 0 ? "../".repeat(upCount) : "";

    let expected: string;
    if (downSegments.length === 0) {
        expected = upCount > 0 ? normalizeDots(upPrefix) : ".";
    } else {
        expected = `${upPrefix}${downSegments.join("/")}`;
    }
    const expectedDot =
        downSegments.length > 0 ? `./${downSegments.join("/")}` : ".";

    return (
        normalized === normalizeDots(expected) ||
        normalized === normalizeDots(expectedDot)
    );
}

export function resolveImport(
    filename: string,
    importSource: string,
    publicEntryFiles: readonly string[] = DEFAULT_PUBLIC_ENTRY_FILES,
): ResolvedImport | null {
    const fromPath = getModulePath(filename);
    if (fromPath === null) return null;

    if (!importSource.startsWith(".")) {
        const aliased = resolveAliasPath(filename, importSource);
        if (aliased === null) {
            return {
                fromPath,
                pathNoExt: null,
                isExternal: true,
            };
        }
        return {
            fromPath,
            pathNoExt: stripPublicEntry(
                stripExtension(aliased),
                publicEntryFiles,
            ),
            isExternal: false,
        };
    }

    const joined = path.posix.normalize(
        path.posix.join(fromPath, importSource),
    );

    return {
        fromPath,
        pathNoExt: stripPublicEntry(stripExtension(joined), publicEntryFiles),
        isExternal: false,
    };
}

function publicEntryFilesFromOptions(
    options: BoundaryOptions,
): readonly string[] {
    return options.publicEntryFiles ?? DEFAULT_PUBLIC_ENTRY_FILES;
}

function notAllowedReason(
    fromPath: string,
    toPath: string,
    graph: RootFilesGraph,
): string {
    const fromRoot = getFilesRoot(fromPath, graph.roots);
    const toRoot = getFilesRoot(toPath, graph.roots);

    if (toRoot !== null && fromRoot !== toRoot) {
        if (toPath !== toRoot) {
            return "only that root's public entry is importable across roots";
        }
        return "cross-root import requires both sides in rootFiles (and an allowed edge)";
    }

    const fromParent = parentPath(fromPath);
    const toParent = parentPath(toPath);
    if (
        fromParent !== null &&
        toParent !== null &&
        fromParent === toParent
    ) {
        return "they are sibling modules under the same parent";
    }

    return "it is outside the allowed parent→child (or rootFiles) edge";
}

export function classifyImport(
    resolved: ResolvedImport,
    options: BoundaryOptions,
    importSource: string,
): Violation | null {
    if (resolved.isExternal) return null;
    if (resolved.pathNoExt === null) return null;

    const { fromPath, pathNoExt: target } = resolved;
    const publicEntryFiles = publicEntryFilesFromOptions(options);

    if (fromPath === target) return null;

    if (isSharedResourceImport(resolved, options.sharedFiles ?? [])) {
        return null;
    }

    const graph = parseRootFilesGraph(options.rootFiles ?? []);

    const fromRoot = getFilesRoot(fromPath, graph.roots);
    const toRoot = getFilesRoot(target, graph.roots);
    if (
        fromRoot !== null &&
        fromRoot === toRoot &&
        graph.allowFreeInternalRoots.has(fromRoot)
    ) {
        return null;
    }

    if (isAllowedTarget(fromPath, target, graph)) {
        // Alias imports that resolve to the module root are treated as barrels;
        // only relative imports need a canonical relative form check.
        if (
            importSource.startsWith(".") &&
            !isBarrelSource(importSource, fromPath, target, publicEntryFiles)
        ) {
            return {
                id: "publicEntryOnly",
                reason: "the import path must be the canonical public entry form",
            };
        }
        return null;
    }

    if (isAncestor(fromPath, target)) {
        return {
            id: "upwardImport",
            reason:
                "child modules may not import ancestors (except sharedFiles)",
        };
    }

    if (isDescendantNonDirect(fromPath, target)) {
        return {
            id: "skipLevelImport",
            reason: "only a direct child's public entry may be imported",
        };
    }

    return {
        id: "notAllowedTarget",
        reason: notAllowedReason(fromPath, target, graph),
    };
}

/** Module path shown in lint messages (cwd-relative when possible). */
export function toReportPath(modulePath: string): string {
    const normalized = normalizeSlashes(modulePath);
    const cwd = normalizeSlashes(process.cwd());
    if (normalized === cwd) return ".";
    if (normalized.startsWith(`${cwd}/`)) {
        return normalized.slice(cwd.length + 1);
    }
    return normalized;
}

export function getReportedToPath(
    resolved: ResolvedImport,
    violation: ViolationId,
    graph: RootFilesGraph = EMPTY_ROOT_FILES_GRAPH,
): string {
    if (!resolved.pathNoExt) return "";
    let reported = resolved.pathNoExt;
    if (violation === "publicEntryOnly") {
        const parent = parentPath(resolved.pathNoExt);
        if (
            parent !== null &&
            isAllowedTarget(resolved.fromPath, parent, graph) &&
            !isAllowedTarget(resolved.fromPath, resolved.pathNoExt, graph)
        ) {
            reported = parent;
        }
    }
    return toReportPath(reported);
}
