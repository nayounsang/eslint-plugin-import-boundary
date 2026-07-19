import picomatch from "picomatch";
import { parentPath } from "./module-path.js";

export const DEFAULT_PUBLIC_ENTRY_FILES: readonly string[] = ["**/index"];

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

/**
 * Directory-oriented globs (tree matchers), as opposed to file/basename globs.
 * `publicEntryFiles` rejects these — public entries are module files.
 */
export function isDirectoryGlobPattern(pattern: string): boolean {
    const normalized = normalizeSlashes(pattern);
    if (normalized === "*" || normalized === "**") return true;
    if (normalized.endsWith("/")) return true;
    if (normalized.includes("/**")) return true;
    if (/\/\*$/.test(normalized)) return true;
    return false;
}

export function assertPublicEntryFileGlobs(
    patterns: readonly string[],
): void {
    for (const pattern of patterns) {
        if (!isDirectoryGlobPattern(pattern)) continue;
        throw new Error(
            `"publicEntryFiles" must use file globs, not directory globs (got "${pattern}"). ` +
                "Import boundaries are file-granular: each public entry names a module file, " +
                "not a directory tree whose contents would become an open public surface.",
        );
    }
}

function matchesPublicEntryFiles(
    filePath: string,
    publicEntryFiles: readonly string[],
): boolean {
    const normalized = normalizeSlashes(filePath);
    return publicEntryFiles.some((pattern) =>
        picomatch.isMatch(normalized, pattern, { dot: true }),
    );
}

/**
 * Whether `pathNoExt` (extension already stripped) is a public entry file.
 * Matches against `pathNoExt` (extension-agnostic) and `pathNoExt`+ext
 * (for globs that include an extension, e.g. `**` + `/public.ts`).
 */
export function isPublicEntryPath(
    pathNoExt: string,
    publicEntryFiles: readonly string[],
): boolean {
    if (publicEntryFiles.length === 0) return false;

    if (matchesPublicEntryFiles(pathNoExt, publicEntryFiles)) {
        return true;
    }

    for (const ext of FILE_EXTENSIONS) {
        if (matchesPublicEntryFiles(`${pathNoExt}${ext}`, publicEntryFiles)) {
            return true;
        }
    }

    return false;
}

/**
 * If `pathNoExt` is a public entry, return its owning folder module path.
 * Otherwise return `pathNoExt` unchanged.
 */
export function stripPublicEntry(
    pathNoExt: string,
    publicEntryFiles: readonly string[],
): string {
    if (!isPublicEntryPath(pathNoExt, publicEntryFiles)) {
        return pathNoExt;
    }
    return parentPath(pathNoExt) ?? "";
}
