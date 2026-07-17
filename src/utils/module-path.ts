/** Absolute module directory path, e.g. `/project/src/shell/menu`. Empty string = tree root. */

export function parentPath(modulePath: string): string | null {
    if (modulePath === "") return null;
    const lastSlash = modulePath.lastIndexOf("/");
    if (lastSlash === -1) return "";
    if (lastSlash === 0) return "";
    return modulePath.slice(0, lastSlash);
}

export function isUnder(ancestor: string, descendant: string): boolean {
    if (ancestor === "") return descendant !== "";
    return (
        descendant === ancestor || descendant.startsWith(`${ancestor}/`)
    );
}
