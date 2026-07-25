import path from "node:path";

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

function stripTrailingSlashes(value: string): string {
    if (value === "/") return value;
    return value.replace(/\/+$/, "");
}

export type RootFilesEntry =
    | string
    | {
          path: string;
          allowedDependencies?: string[];
          /** When true, any import whose from/to both lie under this root is allowed. */
          allowFreeInternal?: boolean;
      };

/**
 * Directory path for a rootFiles entry.
 * Accepts a plain path (`src/A` or `src/A/`) or a legacy glob
 * (`src/A/` + `**` + `/*.{ts,tsx}`), using the static prefix before the
 * recursive glob segment. Returns null when the value has no usable root.
 */
export function extractFilesRootPrefix(pattern: string): string | null {
    const normalized = stripTrailingSlashes(normalizeSlashes(pattern));
    if (normalized === "" || normalized === "/") return null;

    const idx = normalized.indexOf("/**");
    if (idx > 0) {
        const prefix = stripTrailingSlashes(normalized.slice(0, idx));
        if (prefix === "" || prefix.includes("*") || prefix.includes("?")) {
            return null;
        }
        return prefix;
    }

    if (normalized.includes("*") || normalized.includes("?")) return null;
    return normalized;
}

export function toAbsoluteRoot(
    pattern: string,
    cwd: string = process.cwd(),
): string | null {
    const prefix = extractFilesRootPrefix(pattern);
    if (prefix === null) return null;
    const normalizedCwd = normalizeSlashes(cwd);
    return path.posix.isAbsolute(prefix)
        ? prefix
        : path.posix.join(normalizedCwd, prefix);
}

export type RootFilesGraph = {
    roots: readonly string[];
    /** fromRoot → set of toRoot (barrel targets only). */
    allowedDependencies: ReadonlyMap<string, ReadonlySet<string>>;
    /** Roots whose internals may import each other freely. */
    allowFreeInternalRoots: ReadonlySet<string>;
};

export const EMPTY_ROOT_FILES_GRAPH: RootFilesGraph = {
    roots: [],
    allowedDependencies: new Map(),
    allowFreeInternalRoots: new Set(),
};

function addEdge(
    map: Map<string, Set<string>>,
    from: string,
    to: string,
): void {
    let set = map.get(from);
    if (!set) {
        set = new Set();
        map.set(from, set);
    }
    set.add(to);
}

/**
 * Absolute roots and directed cross-root edges from `rootFiles` entries.
 * String entries form a bidirectional clique; object `allowedDependencies`
 * add outbound edges only.
 */
export function parseRootFilesGraph(
    entries: readonly RootFilesEntry[],
    cwd: string = process.cwd(),
): RootFilesGraph {
    if (entries.length === 0) return EMPTY_ROOT_FILES_GRAPH;

    const normalizedCwd = normalizeSlashes(cwd);
    const roots: string[] = [];
    const stringRoots: string[] = [];
    const objectDeps: Array<{ from: string; deps: readonly string[] }> = [];
    const allowFreeInternalRoots = new Set<string>();

    for (const entry of entries) {
        const pattern = typeof entry === "string" ? entry : entry.path;
        const absolute = toAbsoluteRoot(pattern, normalizedCwd);
        if (absolute === null) continue;

        if (roots.includes(absolute)) {
            throw new Error(`duplicate rootFiles root "${absolute}"`);
        }
        roots.push(absolute);

        if (typeof entry === "string") {
            stringRoots.push(absolute);
        } else {
            objectDeps.push({
                from: absolute,
                deps: entry.allowedDependencies ?? [],
            });
            if (entry.allowFreeInternal === true) {
                allowFreeInternalRoots.add(absolute);
            }
        }
    }

    const allowedDependencies = new Map<string, Set<string>>();

    for (const from of stringRoots) {
        for (const to of stringRoots) {
            if (from === to) continue;
            addEdge(allowedDependencies, from, to);
        }
    }

    for (const { from, deps } of objectDeps) {
        for (const dep of deps) {
            const to = toAbsoluteRoot(dep, normalizedCwd);
            if (to === null) {
                throw new Error(
                    `allowedDependencies path is invalid: "${dep}"`,
                );
            }
            if (to === from) {
                throw new Error(
                    `allowedDependencies cannot reference its own root ("${dep}")`,
                );
            }
            if (!roots.includes(to)) {
                throw new Error(
                    `allowedDependencies references unknown root "${dep}"`,
                );
            }
            addEdge(allowedDependencies, from, to);
        }
    }

    return { roots, allowedDependencies, allowFreeInternalRoots };
}

/** Absolute module roots derived from `rootFiles` entries. */
export function parseFilesRoots(
    entries: readonly RootFilesEntry[],
    cwd: string = process.cwd(),
): string[] {
    return [...parseRootFilesGraph(entries, cwd).roots];
}

/** Longest matching rootFiles root that contains `modulePath`, or null. */
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
