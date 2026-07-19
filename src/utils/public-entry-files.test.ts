import { describe, expect, it } from "vitest";
import {
    assertPublicEntryFileGlobs,
    isDirectoryGlobPattern,
    isPublicEntryPath,
    stripPublicEntry,
} from "./public-entry-files.js";

describe("isDirectoryGlobPattern", () => {
    it("detects directory-oriented globs", () => {
        expect(isDirectoryGlobPattern("**/api/**")).toBe(true);
        expect(isDirectoryGlobPattern("**/api/*")).toBe(true);
        expect(isDirectoryGlobPattern("src/api/")).toBe(true);
        expect(isDirectoryGlobPattern("**")).toBe(true);
    });

    it("allows file / basename globs", () => {
        expect(isDirectoryGlobPattern("**/index")).toBe(false);
        expect(isDirectoryGlobPattern("**/public.ts")).toBe(false);
        expect(isDirectoryGlobPattern("**/mod.*")).toBe(false);
    });
});

describe("assertPublicEntryFileGlobs", () => {
    it("throws on directory globs", () => {
        expect(() =>
            assertPublicEntryFileGlobs(["**/index", "**/api/**"]),
        ).toThrow(/must use file globs, not directory globs/);
    });

    it("allows file globs", () => {
        expect(() =>
            assertPublicEntryFileGlobs(["**/index", "**/public.ts"]),
        ).not.toThrow();
    });
});

describe("isPublicEntryPath", () => {
    it("matches **/index against any extension-stripped index path", () => {
        expect(
            isPublicEntryPath("/project/src/menu/index", ["**/index"]),
        ).toBe(true);
        expect(isPublicEntryPath("menu/index", ["**/index"])).toBe(true);
    });

    it("does not treat a folder path as an entry", () => {
        expect(isPublicEntryPath("/project/src/menu", ["**/index"])).toBe(
            false,
        );
    });

    it("matches extension-qualified globs via ext probe", () => {
        expect(
            isPublicEntryPath("/project/src/menu/public", ["**/public.ts"]),
        ).toBe(true);
        expect(
            isPublicEntryPath("/project/src/menu/public", ["**/other.ts"]),
        ).toBe(false);
    });

    it("returns false for empty patterns", () => {
        expect(isPublicEntryPath("/project/src/menu/index", [])).toBe(false);
    });
});

describe("stripPublicEntry", () => {
    it("strips index to owning folder", () => {
        expect(
            stripPublicEntry("/project/src/menu/index", ["**/index"]),
        ).toBe("/project/src/menu");
    });

    it("leaves non-entry paths unchanged", () => {
        expect(
            stripPublicEntry("/project/src/menu/internal", ["**/index"]),
        ).toBe("/project/src/menu/internal");
    });

    it("strips custom public entry basename", () => {
        expect(
            stripPublicEntry("/project/src/menu/public", ["**/public"]),
        ).toBe("/project/src/menu");
    });
});
