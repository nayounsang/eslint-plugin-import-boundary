import path from "node:path";
import { parseFilesRoots } from "./files-roots.js";
import type { BoundaryOptions } from "./options.js";
import { parentPath } from "./module-path.js";
import {
    isAllowedTarget,
    isAncestor,
    isDescendantNonDirect,
} from "./relations/index.js";
import { isSharedResourceImport } from "./shared-files.js";
import { resolveAliasPath } from "./tsconfig-paths.js";

export type { BoundaryOptions };

export type ResolvedImport = {
    fromPath: string;
    /** Absolute path without extension / trailing index, e.g. `/project/src/shell/tabs` */
    pathNoExt: string | null;
    isExternal: boolean;
};

export type ViolationId =
    | "barrelOnly"
    | "upwardImport"
    | "skipLevelImport"
    | "notAllowedTarget";

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

export function getModulePath(filename: string | undefined): string | null {
    if (!filename || filename === "<input>" || filename === "<text>") {
        return null;
    }
    return path.posix.dirname(normalizeSlashes(filename));
}

function stripExtensionAndIndex(absolutePath: string): string {
    let result = absolutePath.replace(/\.(tsx?|jsx?|mts|cts|mjs|cjs)$/, "");
    if (result.endsWith("/index")) {
        result = result.slice(0, -"/index".length);
    }
    if (result === "index") {
        return "";
    }
    return result;
}

function normalizeDots(value: string): string {
    return value.replace(/\/+$/, "") || ".";
}

export function isBarrelSource(
    importSource: string,
    fromPath: string,
    toPath: string,
): boolean {
    const normalized = normalizeDots(
        importSource.replace(/\/index\.tsx?$/, "").replace(/\/index$/, ""),
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
            pathNoExt: stripExtensionAndIndex(aliased),
            isExternal: false,
        };
    }

    const joined = path.posix.normalize(
        path.posix.join(fromPath, importSource),
    );

    return {
        fromPath,
        pathNoExt: stripExtensionAndIndex(joined),
        isExternal: false,
    };
}

export function classifyImport(
    resolved: ResolvedImport,
    options: BoundaryOptions,
    importSource: string,
): ViolationId | null {
    if (resolved.isExternal) return null;
    if (resolved.pathNoExt === null) return null;

    const { fromPath, pathNoExt: target } = resolved;

    if (fromPath === target) return null;

    if (isSharedResourceImport(resolved, options.sharedFiles ?? [])) {
        return null;
    }

    const roots = parseFilesRoots(options.files ?? []);

    if (isAllowedTarget(fromPath, target, roots)) {
        // Alias imports that resolve to the module root are treated as barrels;
        // only relative imports need a canonical relative form check.
        if (
            importSource.startsWith(".") &&
            !isBarrelSource(importSource, fromPath, target)
        ) {
            return "barrelOnly";
        }
        return null;
    }

    if (isAncestor(fromPath, target)) {
        return "upwardImport";
    }

    if (isDescendantNonDirect(fromPath, target)) {
        return "skipLevelImport";
    }

    return "notAllowedTarget";
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
    roots: readonly string[] = [],
): string {
    if (!resolved.pathNoExt) return "";
    let reported = resolved.pathNoExt;
    if (violation === "barrelOnly") {
        const parent = parentPath(resolved.pathNoExt);
        if (
            parent !== null &&
            isAllowedTarget(resolved.fromPath, parent, roots) &&
            !isAllowedTarget(resolved.fromPath, resolved.pathNoExt, roots)
        ) {
            reported = parent;
        }
    }
    return toReportPath(reported);
}
