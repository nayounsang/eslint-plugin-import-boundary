import { describe, expect, it } from "vitest";
import { isFilesCrossImport } from "./files.js";
import { parseRootFilesGraph } from "./files-roots.js";

const clique = parseRootFilesGraph(
    ["A", "B"],
    "/",
);

describe("isFilesCrossImport", () => {
    it("allows importing another rootFiles root barrel", () => {
        expect(isFilesCrossImport("/A/foo", "/B", clique)).toBe(true);
        expect(isFilesCrossImport("/A", "/B", clique)).toBe(true);
    });

    it("denies importing internals of another rootFiles root", () => {
        expect(isFilesCrossImport("/A/foo", "/B/foo", clique)).toBe(false);
    });

    it("denies same-root peer barrels (peer policy removed)", () => {
        expect(isFilesCrossImport("/A/foo", "/A/bar", clique)).toBe(false);
    });

    it("honors directed allowedDependencies edges", () => {
        const graph = parseRootFilesGraph(
            [
                "A",
                {
                    path: "B",
                    allowedDependencies: ["A"],
                },
            ],
            "/",
        );
        expect(isFilesCrossImport("/B/foo", "/A", graph)).toBe(true);
        expect(isFilesCrossImport("/A/foo", "/B", graph)).toBe(false);
    });
});
