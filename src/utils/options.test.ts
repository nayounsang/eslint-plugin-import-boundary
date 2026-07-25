import { describe, expect, it } from "vitest";
import { parseOptions } from "./options.js";

describe("parseOptions", () => {
    it("defaults publicEntryFiles, sharedFiles, and rootFiles when omitted", () => {
        expect(parseOptions({})).toEqual({
            publicEntryFiles: ["**/index"],
            sharedFiles: [],
            rootFiles: [],
        });
        expect(parseOptions(undefined)).toEqual({
            publicEntryFiles: ["**/index"],
            sharedFiles: [],
            rootFiles: [],
        });
    });

    it("accepts publicEntryFiles globs", () => {
        expect(parseOptions({ publicEntryFiles: ["**/mod"] })).toEqual({
            publicEntryFiles: ["**/mod"],
            sharedFiles: [],
            rootFiles: [],
        });
    });

    it("accepts empty publicEntryFiles to disable entry stripping", () => {
        expect(parseOptions({ publicEntryFiles: [] })).toEqual({
            publicEntryFiles: [],
            sharedFiles: [],
            rootFiles: [],
        });
    });

    it("rejects directory globs in publicEntryFiles", () => {
        expect(() =>
            parseOptions({ publicEntryFiles: ["**/api/**"] }),
        ).toThrow(/must use file globs, not directory globs/);
        expect(() =>
            parseOptions({ publicEntryFiles: ["**/api/*"] }),
        ).toThrow(/must use file globs, not directory globs/);
        expect(() =>
            parseOptions({ publicEntryFiles: ["src/api/"] }),
        ).toThrow(/must use file globs, not directory globs/);
    });

    it("accepts sharedFiles globs", () => {
        expect(parseOptions({ sharedFiles: ["**/foo.ts"] })).toEqual({
            publicEntryFiles: ["**/index"],
            sharedFiles: ["**/foo.ts"],
            rootFiles: [],
        });
    });

    it("accepts rootFiles paths", () => {
        expect(
            parseOptions({
                rootFiles: ["A", "B"],
            }),
        ).toEqual({
            publicEntryFiles: ["**/index"],
            sharedFiles: [],
            rootFiles: ["A", "B"],
        });
    });

    it("accepts rootFiles object entries with allowedDependencies", () => {
        expect(
            parseOptions({
                rootFiles: [
                    "A",
                    {
                        path: "B",
                        allowedDependencies: ["A"],
                    },
                ],
            }),
        ).toEqual({
            publicEntryFiles: ["**/index"],
            sharedFiles: [],
            rootFiles: [
                "A",
                {
                    path: "B",
                    allowedDependencies: ["A"],
                },
            ],
        });
    });

    it("accepts rootFiles object entries with allowFreeInternal", () => {
        expect(
            parseOptions({
                rootFiles: [
                    "A",
                    {
                        path: "B",
                        allowFreeInternal: true,
                        allowedDependencies: ["A"],
                    },
                ],
            }),
        ).toEqual({
            publicEntryFiles: ["**/index"],
            sharedFiles: [],
            rootFiles: [
                "A",
                {
                    path: "B",
                    allowFreeInternal: true,
                    allowedDependencies: ["A"],
                },
            ],
        });
    });

    it("rejects non-boolean allowFreeInternal", () => {
        expect(() =>
            parseOptions({
                rootFiles: [
                    {
                        path: "A",
                        allowFreeInternal: "yes",
                    },
                ],
            }),
        ).toThrow(/import-boundary: invalid options/);
    });

    it("rejects unknown keys with a schema message", () => {
        expect(() => parseOptions({ sharedFiles: [], root: "src" })).toThrow(
            /Unknown option keys are not allowed/,
        );
    });

    it("rejects non-string publicEntryFiles entries with a schema message", () => {
        expect(() => parseOptions({ publicEntryFiles: [1] })).toThrow(
            /Each "publicEntryFiles" entry must be a glob string/,
        );
    });

    it("rejects non-string sharedFiles entries with a schema message", () => {
        expect(() => parseOptions({ sharedFiles: [1] })).toThrow(
            /Each "sharedFiles" entry must be a glob string/,
        );
    });

    it("rejects invalid rootFiles entries with a schema message", () => {
        expect(() => parseOptions({ rootFiles: [1] })).toThrow(
            /Each "rootFiles" entry must be a path string or object/,
        );
    });

    it("rejects unknown allowedDependencies roots", () => {
        expect(() =>
            parseOptions({
                rootFiles: [
                    "A",
                    {
                        path: "B",
                        allowedDependencies: ["C"],
                    },
                ],
            }),
        ).toThrow(/allowedDependencies references unknown root/);
    });

    it("rejects self-referential allowedDependencies", () => {
        expect(() =>
            parseOptions({
                rootFiles: [
                    {
                        path: "A",
                        allowedDependencies: ["A"],
                    },
                ],
            }),
        ).toThrow(/allowedDependencies cannot reference its own root/);
    });

    it("rejects duplicate rootFiles roots", () => {
        expect(() =>
            parseOptions({
                rootFiles: ["A", "A"],
            }),
        ).toThrow(/duplicate rootFiles root/);
    });
});
