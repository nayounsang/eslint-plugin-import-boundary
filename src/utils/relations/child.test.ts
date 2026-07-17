import { describe, expect, it } from "vitest";
import { isDirectChild, isDescendantNonDirect } from "./child.js";

describe("isDirectChild", () => {
    it("treats single-segment paths as children of the tree root", () => {
        expect(isDirectChild("", "menu")).toBe(true);
        expect(isDirectChild("", "menu/detail")).toBe(false);
        expect(isDirectChild("", "")).toBe(false);
    });

    it("requires exactly one extra segment under fromPath", () => {
        expect(isDirectChild("shell", "shell/menu")).toBe(true);
        expect(isDirectChild("shell", "shell/menu/detail")).toBe(false);
        expect(isDirectChild("shell", "shell")).toBe(false);
        expect(isDirectChild("shell", "tabs")).toBe(false);
    });
});

describe("isDescendantNonDirect", () => {
    it("detects grandchildren and deeper", () => {
        expect(isDescendantNonDirect("shell", "shell/menu/detail")).toBe(true);
        expect(isDescendantNonDirect("shell", "shell/menu")).toBe(false);
        expect(isDescendantNonDirect("", "menu/detail")).toBe(true);
        expect(isDescendantNonDirect("", "menu")).toBe(false);
    });
});
