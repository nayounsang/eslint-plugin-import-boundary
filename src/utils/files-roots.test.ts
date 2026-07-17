import { describe, expect, it } from "vitest";
import {
    extractFilesRootPrefix,
    getFilesRoot,
    parseFilesRoots,
} from "./files-roots.js";

describe("extractFilesRootPrefix", () => {
    it("takes the path before /**", () => {
        expect(extractFilesRootPrefix("A/**/*.{ts,tsx}")).toBe("A");
        expect(extractFilesRootPrefix("src/A/**/*.{ts,tsx}")).toBe("src/A");
    });

    it("returns null without a usable /** prefix", () => {
        expect(extractFilesRootPrefix("A/*.{ts,tsx}")).toBeNull();
        expect(extractFilesRootPrefix("**/A/**")).toBeNull();
    });
});

describe("parseFilesRoots", () => {
    const cwd = "/cwd";

    it("joins relative prefixes to cwd", () => {
        expect(parseFilesRoots(["A/**/*.{ts,tsx}"], cwd)).toEqual(["/cwd/A"]);
        expect(parseFilesRoots(["src/A/**/*.{ts,tsx}"], cwd)).toEqual([
            "/cwd/src/A",
        ]);
    });

    it("keeps absolute prefixes", () => {
        expect(
            parseFilesRoots(["/project/src/A/**/*.{ts,tsx}"], cwd),
        ).toEqual(["/project/src/A"]);
    });

    it("parses multiple patterns into a root list", () => {
        expect(
            parseFilesRoots(
                ["A/**/*.{ts,tsx}", "B/**/*.{ts,tsx}"],
                cwd,
            ),
        ).toEqual(["/cwd/A", "/cwd/B"]);
    });
});

describe("getFilesRoot", () => {
    const roots = ["/cwd/A", "/cwd/B"];

    it("returns the longest matching root", () => {
        expect(getFilesRoot("/cwd/A/foo", roots)).toBe("/cwd/A");
        expect(getFilesRoot("/cwd/B", roots)).toBe("/cwd/B");
    });

    it("returns null when no root matches", () => {
        expect(getFilesRoot("/cwd/C/foo", roots)).toBeNull();
    });
});
