import { describe, expect, it } from "vitest";
import { isFilesCrossImport, isFilesPeerImport } from "./files.js";

const roots = ["/A", "/B"];

describe("isFilesPeerImport", () => {
    it("allows peer barrels under the same files root", () => {
        expect(isFilesPeerImport("/A/foo", "/A/bar", roots)).toBe(true);
    });

    it("denies nested peers that are not root direct children", () => {
        expect(isFilesPeerImport("/A/foo/x", "/A/foo/y", roots)).toBe(false);
    });

    it("denies deep imports into a peer subtree", () => {
        expect(isFilesPeerImport("/A/foo", "/A/bar/util", roots)).toBe(false);
    });

    it("denies importing the files root itself (upward)", () => {
        expect(isFilesPeerImport("/A/foo", "/A", roots)).toBe(false);
    });
});

describe("isFilesCrossImport", () => {
    it("allows importing another files root barrel", () => {
        expect(isFilesCrossImport("/A/foo", "/B", roots)).toBe(true);
        expect(isFilesCrossImport("/A", "/B", roots)).toBe(true);
    });

    it("denies importing internals of another files root", () => {
        expect(isFilesCrossImport("/A/foo", "/B/foo", roots)).toBe(false);
    });
});
