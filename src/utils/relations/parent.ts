/** `toPath` is an ancestor of `fromPath` (strict). */
export function isAncestor(fromPath: string, toPath: string): boolean {
    if (toPath === "") return fromPath !== "";
    return fromPath.startsWith(`${toPath}/`);
}
