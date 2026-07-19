import { describe, expect, it } from "vitest";
import { classifyImport, type ResolvedImport } from "./boundary-context.js";

function resolved(
    fromPath: string,
    pathNoExt: string,
): ResolvedImport {
    return { fromPath, pathNoExt, isExternal: false };
}

describe("classifyImport reasons", () => {
    it("publicEntryOnly uses canonical-path reason", () => {
        const v = classifyImport(
            resolved("/project/src/shell", "/project/src/shell/menu"),
            {},
            "../shell/menu",
        );
        expect(v).toEqual({
            id: "publicEntryOnly",
            reason: "the import path must be the canonical public entry form",
        });
    });

    it("skipLevelImport explains direct-child-only", () => {
        const v = classifyImport(
            resolved("/project/src/shell", "/project/src/shell/menu/detail"),
            {},
            "./menu/detail",
        );
        expect(v).toEqual({
            id: "skipLevelImport",
            reason: "only a direct child's public entry may be imported",
        });
    });

    it("upwardImport explains ancestor ban", () => {
        const v = classifyImport(
            resolved("/project/src/shell/menu", "/project/src/shell"),
            {},
            "..",
        );
        expect(v).toEqual({
            id: "upwardImport",
            reason:
                "child modules may not import ancestors (except sharedFiles)",
        });
    });

    it("notAllowedTarget explains siblings", () => {
        const v = classifyImport(
            resolved("/project/src/shell/menu", "/project/src/shell/tabs"),
            {},
            "../tabs",
        );
        expect(v).toEqual({
            id: "notAllowedTarget",
            reason: "they are sibling modules under the same parent",
        });
    });

    it("notAllowedTarget explains missing cross-root edge", () => {
        const v = classifyImport(
            resolved(
                "/project/src/features/auth",
                "/project/src/features/cart",
            ),
            {
                rootFiles: [
                    {
                        path: "/project/src/features/auth",
                        allowedDependencies: [],
                    },
                    "/project/src/features/cart",
                ],
            },
            "../cart",
        );
        expect(v).toEqual({
            id: "notAllowedTarget",
            reason:
                "cross-root import requires both sides in rootFiles (and an allowed edge)",
        });
    });

    it("notAllowedTarget explains cross-root internals", () => {
        const v = classifyImport(
            resolved(
                "/project/src/features/auth",
                "/project/src/features/cart/internal",
            ),
            {
                rootFiles: [
                    "/project/src/features/auth",
                    "/project/src/features/cart",
                ],
            },
            "../cart/internal",
        );
        expect(v).toEqual({
            id: "notAllowedTarget",
            reason:
                "only that root's public entry is importable across roots",
        });
    });
});
