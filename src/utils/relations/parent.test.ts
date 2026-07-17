import { describe, expect, it } from "vitest";
import { isAncestor } from "./parent.js";

describe("isAncestor", () => {
    it("is true when toPath is a strict ancestor of fromPath", () => {
        expect(isAncestor("shell/menu", "shell")).toBe(true);
        expect(isAncestor("shell/menu/detail", "shell")).toBe(true);
        expect(isAncestor("shell/menu", "")).toBe(true);
    });

    it("is false for self, peers, and descendants", () => {
        expect(isAncestor("shell", "shell")).toBe(false);
        expect(isAncestor("shell", "shell/menu")).toBe(false);
        expect(isAncestor("shell/menu", "shell/tabs")).toBe(false);
        expect(isAncestor("", "")).toBe(false);
    });
});
