import path from "node:path";
import {
    createPathsMatcher,
    findTsconfig,
    getTsconfig,
    type Cache,
    type TsConfigResult,
} from "get-tsconfig";

const tsconfigCache: Cache = new Map();
/** searchPath(directory) → loaded tsconfig, or null if none */
const searchCache = new Map<string, TsConfigResult | null>();

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

/**
 * Prefer the nearest config. At the same directory, prefer tsconfig.json over
 * jsconfig.json. A nested jsconfig must win over a parent tsconfig.
 */
function findNearestConfigPath(searchPath: string): string | undefined {
    const tsPath = findTsconfig(searchPath, "tsconfig.json", tsconfigCache);
    const jsPath = findTsconfig(searchPath, "jsconfig.json", tsconfigCache);

    if (tsPath && jsPath) {
        const tsDir = path.dirname(tsPath);
        const jsDir = path.dirname(jsPath);
        if (tsDir === jsDir) return tsPath;
        return tsDir.length >= jsDir.length ? tsPath : jsPath;
    }
    return tsPath ?? jsPath;
}

function loadTsconfig(searchPath: string): TsConfigResult | null {
    const cached = searchCache.get(searchPath);
    if (cached !== undefined) return cached;

    const configPath = findNearestConfigPath(searchPath);
    if (!configPath) {
        searchCache.set(searchPath, null);
        return null;
    }

    const tsconfig = getTsconfig(
        path.dirname(configPath),
        path.basename(configPath),
        tsconfigCache,
    );
    searchCache.set(searchPath, tsconfig);
    return tsconfig;
}

/** True when `importSource` matches a TypeScript `paths` pattern (single `*`). */
export function matchesPathPattern(
    importSource: string,
    pattern: string,
): boolean {
    const star = pattern.indexOf("*");
    if (star === -1) {
        return importSource === pattern;
    }
    const prefix = pattern.slice(0, star);
    const suffix = pattern.slice(star + 1);
    if (importSource.length < prefix.length + suffix.length) {
        return false;
    }
    return (
        importSource.startsWith(prefix) && importSource.endsWith(suffix)
    );
}

function matchesConfiguredPaths(
    importSource: string,
    paths: Record<string, string[]>,
): boolean {
    return Object.keys(paths).some((pattern) =>
        matchesPathPattern(importSource, pattern),
    );
}

/**
 * Resolve a non-relative import via nearest tsconfig/jsconfig `paths`.
 * Returns an absolute filesystem path (may include extension), or null when
 * no config / no paths match (e.g. npm packages). Does not use baseUrl-only
 * fallback, so bare package names stay external.
 */
export function resolveAliasPath(
    filename: string,
    importSource: string,
): string | null {
    const searchPath = path.posix.dirname(normalizeSlashes(filename));
    const tsconfig = loadTsconfig(searchPath);
    if (!tsconfig) return null;

    const paths = tsconfig.config.compilerOptions?.paths;
    if (!paths || Object.keys(paths).length === 0) return null;
    if (!matchesConfiguredPaths(importSource, paths)) return null;

    const matcher = createPathsMatcher(tsconfig);
    if (!matcher) return null;

    const candidates = matcher(importSource);
    if (candidates.length === 0) return null;

    return normalizeSlashes(candidates[0]!);
}

/** Clear caches (for tests). */
export function clearTsconfigPathsCache(): void {
    tsconfigCache.clear();
    searchCache.clear();
}
