import { describe, expect, it } from "vitest";
import {
    extractFilesRootPrefix,
    getFilesRoot,
    parseFilesRoots,
    parseRootFilesGraph,
} from "./files-roots.js";

describe("extractFilesRootPrefix", () => {
    it("uses a plain directory path", () => {
        expect(extractFilesRootPrefix("A")).toBe("A");
        expect(extractFilesRootPrefix("src/A")).toBe("src/A");
    });

    it("strips trailing slashes", () => {
        expect(extractFilesRootPrefix("A/")).toBe("A");
        expect(extractFilesRootPrefix("src/A///")).toBe("src/A");
    });

    it("takes the path before /** for legacy globs", () => {
        expect(extractFilesRootPrefix("A/**/*.{ts,tsx}")).toBe("A");
        expect(extractFilesRootPrefix("src/A/**/*.{ts,tsx}")).toBe("src/A");
    });

    it("returns null without a usable path", () => {
        expect(extractFilesRootPrefix("A/*.{ts,tsx}")).toBeNull();
        expect(extractFilesRootPrefix("**/A/**")).toBeNull();
        expect(extractFilesRootPrefix("")).toBeNull();
    });
});

describe("parseFilesRoots", () => {
    const cwd = "/cwd";

    it("joins relative paths to cwd", () => {
        expect(parseFilesRoots(["A"], cwd)).toEqual(["/cwd/A"]);
        expect(parseFilesRoots(["src/A"], cwd)).toEqual(["/cwd/src/A"]);
        expect(parseFilesRoots(["src/A/"], cwd)).toEqual(["/cwd/src/A"]);
    });

    it("keeps absolute paths", () => {
        expect(parseFilesRoots(["/project/src/A"], cwd)).toEqual([
            "/project/src/A",
        ]);
    });

    it("parses multiple paths into a root list", () => {
        expect(parseFilesRoots(["A", "B"], cwd)).toEqual(["/cwd/A", "/cwd/B"]);
    });

    it("parses object path entries into roots", () => {
        expect(
            parseFilesRoots(["A", { path: "B" }], cwd),
        ).toEqual(["/cwd/A", "/cwd/B"]);
    });

    it("still accepts legacy globs", () => {
        expect(parseFilesRoots(["A/**/*.{ts,tsx}"], cwd)).toEqual(["/cwd/A"]);
    });
});

describe("parseRootFilesGraph", () => {
    const cwd = "/cwd";

    it("builds a bidirectional clique among string entries", () => {
        const graph = parseRootFilesGraph(["A", "B"], cwd);
        expect(graph.roots).toEqual(["/cwd/A", "/cwd/B"]);
        expect(graph.allowedDependencies.get("/cwd/A")).toEqual(
            new Set(["/cwd/B"]),
        );
        expect(graph.allowedDependencies.get("/cwd/B")).toEqual(
            new Set(["/cwd/A"]),
        );
    });

    it("adds directed edges from object allowedDependencies", () => {
        const graph = parseRootFilesGraph(
            [
                "A",
                "C",
                {
                    path: "B",
                    allowedDependencies: ["A"],
                },
            ],
            cwd,
        );
        expect(graph.allowedDependencies.get("/cwd/A")).toEqual(
            new Set(["/cwd/C"]),
        );
        expect(graph.allowedDependencies.get("/cwd/C")).toEqual(
            new Set(["/cwd/A"]),
        );
        expect(graph.allowedDependencies.get("/cwd/B")).toEqual(
            new Set(["/cwd/A"]),
        );
    });

    it("gives object entries no outbound edges when allowedDependencies is omitted", () => {
        const graph = parseRootFilesGraph(["A", { path: "B" }], cwd);
        expect(graph.allowedDependencies.get("/cwd/B")).toBeUndefined();
        expect(graph.allowedDependencies.get("/cwd/A")).toBeUndefined();
        expect(graph.allowFreeInternalRoots.size).toBe(0);
    });

    it("records allowFreeInternal roots", () => {
        const graph = parseRootFilesGraph(
            [
                "A",
                {
                    path: "B",
                    allowFreeInternal: true,
                    allowedDependencies: ["A"],
                },
            ],
            cwd,
        );
        expect(graph.allowFreeInternalRoots).toEqual(new Set(["/cwd/B"]));
        expect(graph.allowFreeInternalRoots.has("/cwd/A")).toBe(false);
    });

    it("ignores allowFreeInternal when false or omitted", () => {
        const graph = parseRootFilesGraph(
            [
                { path: "A", allowFreeInternal: false },
                { path: "B" },
            ],
            cwd,
        );
        expect(graph.allowFreeInternalRoots.size).toBe(0);
    });

    it("treats trailing-slash paths as the same root", () => {
        const graph = parseRootFilesGraph(["A/", "B/"], cwd);
        expect(graph.roots).toEqual(["/cwd/A", "/cwd/B"]);
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
