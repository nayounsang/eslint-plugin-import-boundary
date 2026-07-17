import picomatch from "picomatch";
import type { ResolvedImport } from "./boundary-context.js";
import { parentPath } from "./module-path.js";

const FILE_EXTENSIONS = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mts",
    ".cts",
    ".mjs",
    ".cjs",
] as const;

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

function matchesSharedFiles(
    filePath: string,
    sharedFiles: readonly string[],
): boolean {
    const normalized = normalizeSlashes(filePath);
    return sharedFiles.some((pattern) =>
        picomatch.isMatch(normalized, pattern, { dot: true }),
    );
}

function isDirectoryGlob(pattern: string): boolean {
    return pattern.includes("/**") || /\/\*$/.test(pattern);
}

function matchesSharedFileGlobs(
    filePath: string,
    sharedFiles: readonly string[],
): boolean {
    const normalized = normalizeSlashes(filePath);
    return sharedFiles.some(
        (pattern) =>
            !isDirectoryGlob(pattern) &&
            picomatch.isMatch(normalized, pattern, { dot: true }),
    );
}

/**
 * If `pathNoExt` points at (or into) a sharedFiles match, returns the owning
 * module path (parent of the shared entry). Otherwise null.
 */
export function getSharedOwnerPath(
    pathNoExt: string,
    sharedFiles: readonly string[],
): string | null {
    if (sharedFiles.length === 0) return null;

    for (const ext of FILE_EXTENSIONS) {
        if (matchesSharedFileGlobs(`${pathNoExt}${ext}`, sharedFiles)) {
            return parentPath(pathNoExt) ?? "";
        }
    }

    const segments = pathNoExt.split("/").filter(Boolean);
    const absolute = pathNoExt.startsWith("/");
    for (let len = 1; len <= segments.length; len++) {
        const dirPrefix = `${absolute ? "/" : ""}${segments.slice(0, len).join("/")}`;
        const probe = `${dirPrefix}/__shared_probe__`;
        if (!matchesSharedFiles(probe, sharedFiles)) continue;

        const owner = parentPath(dirPrefix);
        if (owner !== null) {
            const parentProbe =
                owner === "" ? "__shared_probe__" : `${owner}/__shared_probe__`;
            if (matchesSharedFiles(parentProbe, sharedFiles)) continue;
        }
        return owner ?? "";
    }

    return null;
}

export function isImporterInSharedSubtree(
    importerModulePath: string,
    ownerModulePath: string,
): boolean {
    if (ownerModulePath === "") {
        return importerModulePath !== "";
    }
    return (
        importerModulePath === ownerModulePath ||
        importerModulePath.startsWith(`${ownerModulePath}/`)
    );
}

export function isSharedResourceImport(
    resolved: ResolvedImport,
    sharedFiles: readonly string[],
): boolean {
    if (!resolved.pathNoExt || resolved.isExternal) return false;

    const ownerPath = getSharedOwnerPath(resolved.pathNoExt, sharedFiles);
    if (ownerPath === null) return false;

    return isImporterInSharedSubtree(resolved.fromPath, ownerPath);
}
