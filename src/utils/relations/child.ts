/** `toPath` is a direct child module of `fromPath`. */
export function isDirectChild(fromPath: string, toPath: string): boolean {
    if (fromPath === "") {
        return toPath !== "" && !toPath.includes("/");
    }
    return (
        toPath.startsWith(`${fromPath}/`) &&
        !toPath.slice(fromPath.length + 1).includes("/")
    );
}

/** `toPath` is a non-direct descendant of `fromPath` (grandchild+). */
export function isDescendantNonDirect(
    fromPath: string,
    toPath: string,
): boolean {
    if (fromPath === "") {
        return toPath.includes("/");
    }
    if (!toPath.startsWith(`${fromPath}/`)) return false;
    return !isDirectChild(fromPath, toPath);
}
