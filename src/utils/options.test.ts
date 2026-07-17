import { describe, expect, it } from "vitest";
import { parseOptions } from "./options.js";

describe("parseOptions", () => {
    it("defaults sharedFiles and files to empty arrays when omitted", () => {
        expect(parseOptions({})).toEqual({ sharedFiles: [], files: [] });
        expect(parseOptions(undefined)).toEqual({
            sharedFiles: [],
            files: [],
        });
    });

    it("accepts sharedFiles globs", () => {
        expect(parseOptions({ sharedFiles: ["**/foo.ts"] })).toEqual({
            sharedFiles: ["**/foo.ts"],
            files: [],
        });
    });

    it("accepts files globs", () => {
        expect(
            parseOptions({
                files: ["A/**/*.{ts,tsx}", "B/**/*.{ts,tsx}"],
            }),
        ).toEqual({
            sharedFiles: [],
            files: ["A/**/*.{ts,tsx}", "B/**/*.{ts,tsx}"],
        });
    });

    it("rejects unknown keys with a schema message", () => {
        expect(() => parseOptions({ sharedFiles: [], root: "src" })).toThrow(
            /Unknown option keys are not allowed/,
        );
    });

    it("rejects non-string sharedFiles entries with a schema message", () => {
        expect(() => parseOptions({ sharedFiles: [1] })).toThrow(
            /Each "sharedFiles" entry must be a glob string/,
        );
    });

    it("rejects non-string files entries with a schema message", () => {
        expect(() => parseOptions({ files: [1] })).toThrow(
            /Each "files" entry must be a glob string/,
        );
    });
});
