import path from "node:path";

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

/**
 * Path prefix before `/**` in a glob. Returns null if the pattern has no
 * usable static prefix (missing `/**`, or glob chars in the prefix).
 */
export function extractFilesRootPrefix(pattern: string): string | null {
    const normalized = normalizeSlashes(pattern);
    const idx = normalized.indexOf("/**");
    if (idx <= 0) return null;
    const prefix = normalized.slice(0, idx);
    if (prefix.includes("*") || prefix.includes("?")) return null;
    return prefix;
}

/** Absolute module roots derived from `files` globs (cwd-relative prefixes). */
export function parseFilesRoots(
    patterns: readonly string[],
    cwd: string = process.cwd(),
): string[] {
    const normalizedCwd = normalizeSlashes(cwd);
    const roots: string[] = [];
    for (const pattern of patterns) {
        const prefix = extractFilesRootPrefix(pattern);
        if (prefix === null) continue;
        const absolute = path.posix.isAbsolute(prefix)
            ? prefix
            : path.posix.join(normalizedCwd, prefix);
        if (!roots.includes(absolute)) {
            roots.push(absolute);
        }
    }
    return roots;
}

/** Longest matching files root that contains `modulePath`, or null. */
export function getFilesRoot(
    modulePath: string,
    roots: readonly string[],
): string | null {
    let best: string | null = null;
    for (const root of roots) {
        if (modulePath === root || modulePath.startsWith(`${root}/`)) {
            if (best === null || root.length > best.length) {
                best = root;
            }
        }
    }
    return best;
}
