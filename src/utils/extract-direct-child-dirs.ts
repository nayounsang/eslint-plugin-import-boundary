import fs from "node:fs";
import path from "node:path";

function normalizeSlashes(value: string): string {
    return value.replace(/\\/g, "/");
}

/**
 * Lists immediate child directories of `parentPath` as posix-relative paths
 * (relative to `cwd`, default `process.cwd()`). Suitable for spreading into
 * `rootFiles` or similar config arrays.
 */
export function extractDirectChildDirs(
    parentPath: string,
    cwd: string = process.cwd(),
): string[] {
    const normalizedCwd = normalizeSlashes(cwd);
    const absoluteParent = path.posix.isAbsolute(normalizeSlashes(parentPath))
        ? normalizeSlashes(parentPath)
        : path.posix.join(normalizedCwd, normalizeSlashes(parentPath));

    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(absoluteParent, { withFileTypes: true });
    } catch (cause) {
        const message =
            cause instanceof Error ? cause.message : String(cause);
        throw new Error(
            `extractDirectChildDirs: cannot read directory "${parentPath}" — ${message}`,
            { cause },
        );
    }

    const relativeParent = absoluteParent.startsWith(`${normalizedCwd}/`)
        ? absoluteParent.slice(normalizedCwd.length + 1)
        : absoluteParent === normalizedCwd
          ? ""
          : absoluteParent;

    const children: string[] = [];
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith(".")) continue;
        const child = relativeParent
            ? `${relativeParent}/${entry.name}`
            : entry.name;
        children.push(child);
    }

    children.sort();
    return children;
}
